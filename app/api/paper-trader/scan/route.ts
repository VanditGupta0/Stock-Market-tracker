import { NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { PaperTrader } from '@/database/models/paperTrader.model';
import { applyRiskRules } from '@/lib/paper-trader/riskRules';
import { getLiveQuotes } from '@/lib/market/liveQuotes';
import {
    ensureBaselineSnapshot,
    inr,
    loadRiskSettings,
    recordSnapshot,
    setPositionPrice,
} from '@/lib/paper-trader/execution';

/**
 * Refresh prices: revalue every open position at its live price, then apply the user's
 * stop-loss / take-profit rules. Nothing is bought here and no AI is involved; buying and
 * selling happens only through /api/paper-trader/trade, when the user places an order.
 */
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
            return NextResponse.json({ error: 'No paper trading account found. Create one first.' }, { status: 404 });
        }

        const [quotes, risk] = await Promise.all([
            getLiveQuotes(account.positions.map((p) => p.symbol)),
            loadRiskSettings(userId),
        ]);

        await ensureBaselineSnapshot(userId, account);

        // Revalue open positions at live prices. Without a live quote, keep the last known price.
        const stalePositions: string[] = [];
        for (const pos of account.positions) {
            const quote = quotes.get(pos.symbol.toUpperCase());
            if (quote) setPositionPrice(pos, quote.priceInInr, quote.asOf);
            else stalePositions.push(pos.symbol);
        }

        const riskExits = applyRiskRules(account, risk);

        account.lastScanAt = new Date();
        await account.save();
        await recordSnapshot(userId, account);

        const parts: string[] = [];
        if (account.positions.length === 0 && riskExits.length === 0) {
            parts.push('No open positions to update.');
        } else {
            parts.push('Prices updated to the latest live quotes.');
        }
        if (riskExits.length > 0) {
            const net = riskExits.reduce((sum, t) => sum + t.profit, 0);
            parts.push(
                `Your rules closed ${riskExits.length} position${riskExits.length === 1 ? '' : 's'} (${net >= 0 ? '+' : '-'}${inr(Math.abs(net))}).`
            );
        }
        if (stalePositions.length > 0) {
            parts.push(`No live price for ${stalePositions.join(', ')}, so the last known price was kept.`);
        }

        return NextResponse.json({
            closedByRules: riskExits.length,
            stalePositions,
            message: parts.join(' '),
        });
    } catch (err) {
        console.error('Paper trader refresh error:', err);
        return NextResponse.json({ error: 'Failed to refresh prices. Please try again.' }, { status: 500 });
    }
}
