import { NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { PaperTrader } from '@/database/models/paperTrader.model';
import type { IPaperTrade, IPaperPosition } from '@/database/models/paperTrader.model';
import { PaperTraderRisk } from '@/database/models/paperTraderRisk.model';
import { PaperTraderSnapshot } from '@/database/models/paperTraderSnapshot.model';
import {
    DEFAULT_RISK_SETTINGS,
    applyRiskRules,
    levelsFor,
    type RiskSettings,
} from '@/lib/paper-trader/riskRules';
import { PAPER_TRADER_UNIVERSE } from '@/lib/paper-trader/universe';
import { getLiveQuote, getLiveQuotes } from '@/lib/market/liveQuotes';
import {
    askGeminiForTrades,
    fetchFinnhubNews,
    inr,
    round2,
    ruleBasedDecisions,
    type TradeDecision,
} from '@/lib/paper-trader/decisions';

function getFinnhubToken() {
    return process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';
}

const UNIVERSE_NAMES = new Map(PAPER_TRADER_UNIVERSE.map((s) => [s.symbol, s.name]));

function setPositionPrice(pos: IPaperPosition, price: number, asOf: Date) {
    pos.currentPrice = price;
    pos.priceUpdatedAt = asOf;
    pos.marketValue = round2(pos.shares * price);
    pos.unrealizedProfit = round2(pos.marketValue - pos.costBasis);
    pos.unrealizedProfitPercent = pos.costBasis > 0 ? (pos.unrealizedProfit / pos.costBasis) * 100 : 0;
}

function tradeFrom(
    decision: TradeDecision,
    action: 'BUY' | 'SELL',
    company: string,
    shares: number,
    price: number,
    totalAmount: number,
    profit: number,
    profitPercent: number
): IPaperTrade {
    return {
        tradeId: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        symbol: decision.symbol,
        company,
        action,
        strategy: decision.strategy,
        shares,
        price,
        totalAmount,
        profit,
        profitPercent,
        executedAt: new Date(),
        thoughtProcess: decision.thoughtProcess,
        newsCatalyst: { ...decision.newsCatalyst },
        marketTrend: { ...decision.marketTrend, indicators: [...decision.marketTrend.indicators] },
        confidenceScore: decision.confidenceScore,
        riskReward: decision.riskReward,
    };
}

// ---- POST Handler ----

export async function POST() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        await connectToDatabase();

        const account = await PaperTrader.findOne({ userId });
        if (!account) {
            return NextResponse.json(
                { error: 'No paper trading account found. Create one first.' },
                { status: 404 }
            );
        }

        // 1) Fetch the latest news and live prices for held stocks and the buy universe, in parallel
        const [liveNews, quotes] = await Promise.all([
            fetchFinnhubNews(getFinnhubToken()),
            getLiveQuotes([
                ...account.positions.map((p) => p.symbol),
                ...PAPER_TRADER_UNIVERSE.map((s) => s.symbol),
            ]),
        ]);

        // Load the user's stop-loss / take-profit rules (defaults if never saved)
        const riskDoc = await PaperTraderRisk.findOne({ userId }).lean();
        const risk: RiskSettings = riskDoc
            ? {
                  enabled: riskDoc.enabled,
                  stopLossPercent: riskDoc.stopLossPercent,
                  takeProfitPercent: riskDoc.takeProfitPercent,
              }
            : DEFAULT_RISK_SETTINGS;

        // First scan since the account was created/reset: record the starting point for the chart
        const hasSnapshots = await PaperTraderSnapshot.exists({ userId });
        if (!hasSnapshots) {
            await PaperTraderSnapshot.create({
                userId,
                at: account.lastScanAt ?? new Date(),
                portfolioValue: account.cash + account.positions.reduce((sum, p) => sum + p.marketValue, 0),
                cash: account.cash,
                invested: account.positions.reduce((sum, p) => sum + p.costBasis, 0),
            });
        }

        // 2) Revalue open positions at live prices. Without a live quote, keep the last known price.
        const stalePositions: string[] = [];
        for (const pos of account.positions) {
            const quote = quotes.get(pos.symbol.toUpperCase());
            if (quote) setPositionPrice(pos, quote.priceInInr, quote.asOf);
            else stalePositions.push(pos.symbol);
        }

        // 2b) Apply stop-loss / take-profit rules before any new decisions
        const riskExits = applyRiskRules(account, risk);

        // 3) Decide on trades: Gemini first, rule-based fallback only if Gemini could not be used
        const positions = account.positions as IPaperPosition[];
        const geminiDecisions = await askGeminiForTrades(liveNews, positions, account.cash, account.budget, quotes);
        const decisionSource = geminiDecisions === null ? 'rules' : 'gemini';
        const decisions =
            geminiDecisions ?? ruleBasedDecisions(positions, account.cash, account.budget, quotes, risk);

        // 4) Execute decisions at live prices
        const executedTrades: IPaperTrade[] = [...riskExits];
        const skippedNoPrice: string[] = [];

        for (const decision of decisions) {
            if (decision.action === 'HOLD') continue;

            let quote = quotes.get(decision.symbol) ?? null;
            if (!quote) {
                quote = await getLiveQuote(decision.symbol);
                if (quote) quotes.set(decision.symbol, quote);
            }
            if (!quote) {
                skippedNoPrice.push(decision.symbol);
                continue;
            }

            const price = quote.priceInInr;
            const company = decision.company || UNIVERSE_NAMES.get(decision.symbol) || quote.name || decision.symbol;

            if (decision.action === 'BUY') {
                let shares = decision.shares;
                if (shares * price > account.cash) shares = Math.floor(account.cash / price);
                if (shares < 1) continue;

                const cost = round2(shares * price);
                const existingPos = account.positions.find((p) => p.symbol.toUpperCase() === decision.symbol);

                if (existingPos) {
                    existingPos.shares += shares;
                    existingPos.costBasis = round2(existingPos.costBasis + cost);
                    existingPos.avgBuyPrice = round2(existingPos.costBasis / existingPos.shares);
                    setPositionPrice(existingPos, price, quote.asOf);
                    const refreshed = levelsFor(existingPos.avgBuyPrice, risk);
                    existingPos.stopLoss = refreshed.stopLoss;
                    existingPos.targetPrice = refreshed.targetPrice;
                } else {
                    const levels = levelsFor(price, risk);
                    account.positions.push({
                        positionId: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        symbol: decision.symbol,
                        company,
                        shares,
                        avgBuyPrice: price,
                        currentPrice: price,
                        priceUpdatedAt: quote.asOf,
                        costBasis: cost,
                        marketValue: cost,
                        unrealizedProfit: 0,
                        unrealizedProfitPercent: 0,
                        openedAt: new Date(),
                        targetPrice: levels.targetPrice,
                        stopLoss: levels.stopLoss,
                    });
                }

                account.cash = round2(Math.max(0, account.cash - cost));

                const trade = tradeFrom(decision, 'BUY', company, shares, price, cost, 0, 0);
                account.trades.unshift(trade);
                account.totalTrades += 1;
                executedTrades.push(trade);
            }

            if (decision.action === 'SELL') {
                const posIndex = account.positions.findIndex((p) => p.symbol.toUpperCase() === decision.symbol);
                if (posIndex === -1) continue;

                const pos = account.positions[posIndex];
                const shares = Math.min(decision.shares, pos.shares);
                if (shares <= 0) continue;

                const sellValue = round2(shares * price);
                const costOfShares = round2((pos.costBasis / pos.shares) * shares);
                const profit = round2(sellValue - costOfShares);
                const profitPercent = costOfShares > 0 ? (profit / costOfShares) * 100 : 0;

                account.cash = round2(account.cash + sellValue);
                account.realizedProfit = round2(account.realizedProfit + profit);
                if (profit > 0) account.winningTrades += 1;

                if (shares >= pos.shares) {
                    account.positions.splice(posIndex, 1);
                } else {
                    pos.shares -= shares;
                    pos.costBasis = round2(pos.costBasis - costOfShares);
                    setPositionPrice(pos, price, quote.asOf);
                }

                const trade = tradeFrom(decision, 'SELL', pos.company || company, shares, price, sellValue, profit, profitPercent);
                account.trades.unshift(trade);
                account.totalTrades += 1;
                executedTrades.push(trade);
            }
        }

        account.lastScanAt = new Date();
        await account.save();

        // Record a point for the performance chart
        await PaperTraderSnapshot.create({
            userId,
            at: account.lastScanAt,
            portfolioValue: account.cash + account.positions.reduce((sum, p) => sum + p.marketValue, 0),
            cash: account.cash,
            invested: account.positions.reduce((sum, p) => sum + p.costBasis, 0),
        });

        // 5) Summary for the UI
        const realized = executedTrades
            .filter((t) => t.action === 'SELL')
            .reduce((sum, t) => sum + t.profit, 0);

        const parts = [
            `Executed ${executedTrades.length} trade(s) at live market prices.`,
            decisionSource === 'rules'
                ? 'Gemini was unavailable, so rule-based signals from live prices were used.'
                : decisions.length === 0
                  ? 'Gemini found no compelling trades this time.'
                  : 'Decisions by Gemini.',
        ];
        if (realized !== 0) parts.push(`Realized ${realized > 0 ? '+' : '-'}${inr(Math.abs(realized))}.`);
        if (stalePositions.length > 0) {
            parts.push(`No live price for ${stalePositions.join(', ')}, so the last known price was kept.`);
        }
        if (skippedNoPrice.length > 0) {
            parts.push(`Skipped ${skippedNoPrice.join(', ')} (no live price).`);
        }

        return NextResponse.json({
            trades: executedTrades.length,
            decisionSource,
            stalePositions,
            skippedNoPrice,
            message: parts.join(' '),
        });
    } catch (err) {
        console.error('Paper trader scan error:', err);
        return NextResponse.json(
            { error: 'Failed to scan market. Please try again.' },
            { status: 500 }
        );
    }
}
