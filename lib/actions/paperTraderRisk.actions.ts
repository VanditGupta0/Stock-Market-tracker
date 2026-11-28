'use server';

import { connectToDatabase } from '@/database/mongoose';
import { PaperTrader } from '@/database/models/paperTrader.model';
import { PaperTraderRisk } from '@/database/models/paperTraderRisk.model';
import { PaperTraderSnapshot } from '@/database/models/paperTraderSnapshot.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { DEFAULT_RISK_SETTINGS, levelsFor, type RiskSettings } from '@/lib/paper-trader/riskRules';

async function getSessionUserId(): Promise<string | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
}

/** `budget` is the money put in at that point (null on points saved before deposits were tracked). */
export type PerformancePoint = { at: string; portfolioValue: number; budget: number | null };

/** Saved risk rules for the logged-in user (defaults if none saved yet). */
export async function getRiskSettings(): Promise<RiskSettings> {
    const userId = await getSessionUserId();
    if (!userId) return DEFAULT_RISK_SETTINGS;

    await connectToDatabase();
    const doc = await PaperTraderRisk.findOne({ userId }).lean();
    if (!doc) return DEFAULT_RISK_SETTINGS;

    return {
        enabled: doc.enabled,
        stopLossPercent: doc.stopLossPercent,
        takeProfitPercent: doc.takeProfitPercent,
    };
}

/**
 * Save risk rules and re-apply them to the positions that are open right now,
 * measured from each position's average buy price.
 */
export async function saveRiskSettings(
    input: RiskSettings
): Promise<{ ok: true; settings: RiskSettings } | { ok: false; error: string }> {
    const userId = await getSessionUserId();
    if (!userId) return { ok: false, error: 'You need to be signed in.' };

    const stop = Number(input.stopLossPercent);
    const take = Number(input.takeProfitPercent);
    if (!Number.isFinite(stop) || stop < 0.5 || stop > 50) {
        return { ok: false, error: 'Stop-loss must be between 0.5% and 50%.' };
    }
    if (!Number.isFinite(take) || take < 0.5 || take > 200) {
        return { ok: false, error: 'Take-profit must be between 0.5% and 200%.' };
    }

    const settings: RiskSettings = {
        enabled: Boolean(input.enabled),
        stopLossPercent: Math.round(stop * 100) / 100,
        takeProfitPercent: Math.round(take * 100) / 100,
    };

    await connectToDatabase();
    await PaperTraderRisk.findOneAndUpdate({ userId }, { $set: settings, $setOnInsert: { userId } }, { upsert: true });

    const account = await PaperTrader.findOne({ userId });
    if (account && account.positions.length > 0) {
        for (const pos of account.positions) {
            const levels = levelsFor(pos.avgBuyPrice, settings);
            pos.stopLoss = levels.stopLoss;
            pos.targetPrice = levels.targetPrice;
        }
        await account.save();
    }

    return { ok: true, settings };
}

/** Portfolio value after each scan, oldest first (latest 200 points). */
export async function getPerformanceHistory(): Promise<PerformancePoint[]> {
    const userId = await getSessionUserId();
    if (!userId) return [];

    await connectToDatabase();
    const docs = await PaperTraderSnapshot.find({ userId }).sort({ at: -1 }).limit(200).lean();

    return docs.reverse().map((d) => ({
        at: new Date(d.at).toISOString(),
        portfolioValue: d.portfolioValue,
        budget: d.budget ?? null,
    }));
}

/** Clear the chart history (call after the account is reset). */
export async function clearPerformanceHistory(): Promise<void> {
    const userId = await getSessionUserId();
    if (!userId) return;

    await connectToDatabase();
    await PaperTraderSnapshot.deleteMany({ userId });
}
