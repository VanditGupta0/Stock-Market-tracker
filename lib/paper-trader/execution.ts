import type { PaperTraderDoc, IPaperPosition, IPaperTrade } from '@/database/models/paperTrader.model';
import { PaperTraderRisk } from '@/database/models/paperTraderRisk.model';
import { PaperTraderSnapshot } from '@/database/models/paperTraderSnapshot.model';
import { DEFAULT_RISK_SETTINGS, levelsFor, type RiskSettings } from '@/lib/paper-trader/riskRules';
import type { LiveQuote } from '@/lib/market/liveQuotes';

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/** Most shares allowed in a single order (guards against typos like an extra zero). */
export const MAX_SHARES_PER_ORDER = 100000;

export type TradeResult = { ok: true; trade: IPaperTrade } | { ok: false; error: string };

/** Revalue a position at a new price. */
export function setPositionPrice(pos: IPaperPosition, price: number, asOf: Date) {
    pos.currentPrice = price;
    pos.priceUpdatedAt = asOf;
    pos.marketValue = round2(pos.shares * price);
    pos.unrealizedProfit = round2(pos.marketValue - pos.costBasis);
    pos.unrealizedProfitPercent = pos.costBasis > 0 ? (pos.unrealizedProfit / pos.costBasis) * 100 : 0;
}

/** The user's stop-loss / take-profit rules (defaults if never saved). */
export async function loadRiskSettings(userId: string): Promise<RiskSettings> {
    const doc = await PaperTraderRisk.findOne({ userId }).lean();
    if (!doc) return DEFAULT_RISK_SETTINGS;
    return {
        enabled: doc.enabled,
        stopLossPercent: doc.stopLossPercent,
        takeProfitPercent: doc.takeProfitPercent,
    };
}

function snapshotValues(account: PaperTraderDoc) {
    return {
        portfolioValue: round2(account.cash + account.positions.reduce((sum, p) => sum + p.marketValue, 0)),
        cash: account.cash,
        invested: round2(account.positions.reduce((sum, p) => sum + p.costBasis, 0)),
    };
}

/**
 * First update since the account was created or reset: record the starting point for the chart.
 * Call this BEFORE changing the account.
 */
export async function ensureBaselineSnapshot(userId: string, account: PaperTraderDoc) {
    const exists = await PaperTraderSnapshot.exists({ userId });
    if (exists) return;
    await PaperTraderSnapshot.create({ userId, at: account.lastScanAt ?? new Date(), ...snapshotValues(account) });
}

/** Record a point on the performance chart. Call this AFTER saving the account. */
export async function recordSnapshot(userId: string, account: PaperTraderDoc) {
    await PaperTraderSnapshot.create({ userId, at: account.lastScanAt ?? new Date(), ...snapshotValues(account) });
}

function manualTrade(
    action: 'BUY' | 'SELL',
    symbol: string,
    company: string,
    shares: number,
    price: number,
    totalAmount: number,
    profit: number,
    profitPercent: number
): IPaperTrade {
    return {
        tradeId: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        symbol,
        company,
        action,
        strategy: 'Manual order',
        shares,
        price,
        totalAmount,
        profit,
        profitPercent,
        executedAt: new Date(),
        thoughtProcess: `You placed this order yourself: ${action === 'BUY' ? 'bought' : 'sold'} ${shares} share${shares === 1 ? '' : 's'} of ${symbol} at the live price of ${inr(price)}.`,
        // The model requires these fields. A confidence score of 0 marks the trade as not AI-generated.
        newsCatalyst: {
            headline: 'Manual order',
            source: 'You',
            summary: 'Placed manually at the live market price.',
            sentiment: 'NEUTRAL',
            impactScore: 0,
            url: '',
        },
        marketTrend: { trendName: 'Manual order', indicators: [], supportResistance: '', timeframe: '', volumeProfile: '' },
        confidenceScore: 0,
        riskReward: '',
    };
}

/** Buy at the live price. Mutates `account`; the caller saves it. */
export function executeBuy(
    account: PaperTraderDoc,
    symbol: string,
    company: string,
    shares: number,
    quote: LiveQuote,
    risk: RiskSettings
): TradeResult {
    const price = quote.priceInInr;
    const cost = round2(shares * price);

    if (cost > account.cash) {
        return {
            ok: false,
            error: `Not enough cash. ${shares} × ${inr(price)} costs ${inr(cost)} but you have ${inr(account.cash)}.`,
        };
    }

    const existing = account.positions.find((p) => p.symbol.toUpperCase() === symbol);
    if (existing) {
        existing.shares += shares;
        existing.costBasis = round2(existing.costBasis + cost);
        existing.avgBuyPrice = round2(existing.costBasis / existing.shares);
        setPositionPrice(existing, price, quote.asOf);
        const levels = levelsFor(existing.avgBuyPrice, risk);
        existing.stopLoss = levels.stopLoss;
        existing.targetPrice = levels.targetPrice;
    } else {
        const levels = levelsFor(price, risk);
        account.positions.push({
            positionId: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            symbol,
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

    account.cash = round2(account.cash - cost);
    const trade = manualTrade('BUY', symbol, company, shares, price, cost, 0, 0);
    account.trades.unshift(trade);
    account.totalTrades += 1;
    return { ok: true, trade };
}

/** Sell at the live price. Mutates `account`; the caller saves it. */
export function executeSell(account: PaperTraderDoc, symbol: string, shares: number, quote: LiveQuote): TradeResult {
    const index = account.positions.findIndex((p) => p.symbol.toUpperCase() === symbol);
    if (index === -1) return { ok: false, error: `You don't hold any ${symbol}.` };

    const pos = account.positions[index];
    if (shares > pos.shares) {
        return { ok: false, error: `You only hold ${pos.shares} share${pos.shares === 1 ? '' : 's'} of ${symbol}.` };
    }

    const price = quote.priceInInr;
    const sellValue = round2(shares * price);
    const costOfShares = round2((pos.costBasis / pos.shares) * shares);
    const profit = round2(sellValue - costOfShares);
    const profitPercent = costOfShares > 0 ? (profit / costOfShares) * 100 : 0;
    const company = pos.company;

    account.cash = round2(account.cash + sellValue);
    account.realizedProfit = round2(account.realizedProfit + profit);
    if (profit > 0) account.winningTrades += 1;

    if (shares >= pos.shares) {
        account.positions.splice(index, 1);
    } else {
        pos.shares -= shares;
        pos.costBasis = round2(pos.costBasis - costOfShares);
        setPositionPrice(pos, price, quote.asOf);
    }

    const trade = manualTrade('SELL', symbol, company, shares, price, sellValue, profit, profitPercent);
    account.trades.unshift(trade);
    account.totalTrades += 1;
    return { ok: true, trade };
}
