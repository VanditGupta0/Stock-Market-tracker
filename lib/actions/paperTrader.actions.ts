'use server';

import { connectToDatabase } from '@/database/mongoose';
import { PaperTrader } from '@/database/models/paperTrader.model';
import type { PaperTraderDoc, IPaperTrade, IPaperPosition } from '@/database/models/paperTrader.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

// ---- Serialization helpers ----

function serializePosition(p: IPaperPosition) {
    return {
        positionId: p.positionId,
        symbol: p.symbol,
        company: p.company,
        shares: p.shares,
        avgBuyPrice: p.avgBuyPrice,
        currentPrice: p.currentPrice,
        costBasis: p.costBasis,
        marketValue: p.marketValue,
        unrealizedProfit: p.unrealizedProfit,
        unrealizedProfitPercent: p.unrealizedProfitPercent,
        openedAt: new Date(p.openedAt).toISOString(),
        targetPrice: p.targetPrice,
        stopLoss: p.stopLoss,
    };
}

function serializeTrade(t: IPaperTrade) {
    return {
        tradeId: t.tradeId,
        symbol: t.symbol,
        company: t.company,
        action: t.action,
        strategy: t.strategy,
        shares: t.shares,
        price: t.price,
        totalAmount: t.totalAmount,
        profit: t.profit,
        profitPercent: t.profitPercent,
        executedAt: new Date(t.executedAt).toISOString(),
        thoughtProcess: t.thoughtProcess,
        newsCatalyst: {
            headline: t.newsCatalyst.headline,
            source: t.newsCatalyst.source,
            summary: t.newsCatalyst.summary,
            sentiment: t.newsCatalyst.sentiment,
            impactScore: t.newsCatalyst.impactScore,
            url: t.newsCatalyst.url ?? '',
        },
        marketTrend: {
            trendName: t.marketTrend.trendName,
            indicators: [...t.marketTrend.indicators],
            supportResistance: t.marketTrend.supportResistance,
            timeframe: t.marketTrend.timeframe,
            volumeProfile: t.marketTrend.volumeProfile,
        },
        confidenceScore: t.confidenceScore,
        riskReward: t.riskReward,
    };
}

function serializeAccount(doc: PaperTraderDoc) {
    const totalInvested = doc.positions.reduce((s, p) => s + p.costBasis, 0);
    const unrealizedProfit = doc.positions.reduce((s, p) => s + p.unrealizedProfit, 0);
    const portfolioValue = doc.cash + doc.positions.reduce((s, p) => s + p.marketValue, 0);
    const totalProfit = doc.realizedProfit + unrealizedProfit;
    const totalProfitPercent = doc.budget > 0 ? (totalProfit / doc.budget) * 100 : 0;
    const winRate = doc.totalTrades > 0 ? (doc.winningTrades / doc.totalTrades) * 100 : 0;

    return {
        userId: doc.userId,
        budget: doc.budget,
        cash: doc.cash,
        totalInvested,
        portfolioValue,
        totalProfit,
        totalProfitPercent,
        realizedProfit: doc.realizedProfit,
        unrealizedProfit,
        totalTrades: doc.totalTrades,
        winningTrades: doc.winningTrades,
        winRate,
        positions: doc.positions.map(serializePosition),
        trades: doc.trades.map(serializeTrade),
        lastScanAt: new Date(doc.lastScanAt).toISOString(),
    };
}

// ---- Exported type (plain objects for client) ----

export type SerializedPaperAccount = ReturnType<typeof serializeAccount>;
export type SerializedTrade = ReturnType<typeof serializeTrade>;
export type SerializedPosition = ReturnType<typeof serializePosition>;

// ---- Actions ----

async function getSessionUserId(): Promise<string | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
}

/** Get or create the paper-trading account for the logged-in user */
export async function getPaperTraderAccount(): Promise<SerializedPaperAccount | null> {
    const userId = await getSessionUserId();
    if (!userId) return null;

    await connectToDatabase();
    const doc = await PaperTrader.findOne({ userId }).lean<PaperTraderDoc>();
    if (!doc) return null;

    return serializeAccount(doc);
}

/** Create a new paper-trading account with the given budget (INR) */
export async function createPaperTraderAccount(budget: number): Promise<SerializedPaperAccount | null> {
    const userId = await getSessionUserId();
    if (!userId) return null;
    if (!budget || budget < 1000) return null;

    await connectToDatabase();

    // Upsert so we don't create duplicates
    const doc = await PaperTrader.findOneAndUpdate(
        { userId },
        {
            $setOnInsert: {
                userId,
                budget,
                cash: budget,
                realizedProfit: 0,
                totalTrades: 0,
                winningTrades: 0,
                positions: [],
                trades: [],
                lastScanAt: new Date(),
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean<PaperTraderDoc>();

    if (!doc) return null;
    return serializeAccount(doc);
}

/** Reset account: wipe trades/positions and re-set budget */
export async function resetPaperTraderAccount(newBudget?: number): Promise<SerializedPaperAccount | null> {
    const userId = await getSessionUserId();
    if (!userId) return null;

    await connectToDatabase();

    const existing = await PaperTrader.findOne({ userId });
    if (!existing) return null;

    const budget = newBudget && newBudget >= 1000 ? newBudget : existing.budget;

    existing.budget = budget;
    existing.cash = budget;
    existing.realizedProfit = 0;
    existing.totalTrades = 0;
    existing.winningTrades = 0;
    existing.positions = [] as unknown as PaperTraderDoc['positions'];
    existing.trades = [] as unknown as PaperTraderDoc['trades'];
    existing.lastScanAt = new Date();
    await existing.save();

    const refreshed = await PaperTrader.findById(existing._id).lean<PaperTraderDoc>();
    if (!refreshed) return null;
    return serializeAccount(refreshed);
}
