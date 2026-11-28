import { NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { PaperTrader } from '@/database/models/paperTrader.model';
import { PAPER_TRADER_UNIVERSE } from '@/lib/paper-trader/universe';
import { getLiveQuote } from '@/lib/market/liveQuotes';
import {
    MAX_SHARES_PER_ORDER,
    ensureBaselineSnapshot,
    executeBuy,
    executeSell,
    inr,
    loadRiskSettings,
    recordSnapshot,
} from '@/lib/paper-trader/execution';

const UNIVERSE_NAMES = new Map(PAPER_TRADER_UNIVERSE.map((s) => [s.symbol, s.name]));

/** Place one manual order at the live market price. The price always comes from the server. */
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json().catch(() => null);
        const symbol = typeof body?.symbol === 'string' ? body.symbol.trim().toUpperCase() : '';
        const action = body?.action;
        const shares = Number(body?.shares);

        if (!symbol) return NextResponse.json({ error: 'Choose a stock.' }, { status: 400 });
        if (action !== 'BUY' && action !== 'SELL') {
            return NextResponse.json({ error: 'Choose Buy or Sell.' }, { status: 400 });
        }
        if (!Number.isInteger(shares) || shares < 1 || shares > MAX_SHARES_PER_ORDER) {
            return NextResponse.json(
                { error: `Enter a whole number of shares between 1 and ${MAX_SHARES_PER_ORDER.toLocaleString('en-IN')}.` },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const account = await PaperTrader.findOne({ userId });
        if (!account) {
            return NextResponse.json({ error: 'No paper trading account found. Create one first.' }, { status: 404 });
        }

        const held = account.positions.find((p) => p.symbol.toUpperCase() === symbol);
        if (action === 'BUY' && !UNIVERSE_NAMES.has(symbol)) {
            return NextResponse.json({ error: `${symbol} is not in the tradable stock list.` }, { status: 400 });
        }
        if (action === 'SELL' && !held) {
            return NextResponse.json({ error: `You don't hold any ${symbol}.` }, { status: 400 });
        }

        const quote = await getLiveQuote(symbol);
        if (!quote) {
            return NextResponse.json(
                { error: `No live price is available for ${symbol} right now. Please try again in a moment.` },
                { status: 502 }
            );
        }

        const risk = await loadRiskSettings(userId);
        await ensureBaselineSnapshot(userId, account);

        const result =
            action === 'BUY'
                ? executeBuy(account, symbol, UNIVERSE_NAMES.get(symbol) ?? quote.name ?? symbol, shares, quote, risk)
                : executeSell(account, symbol, shares, quote);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        account.lastScanAt = new Date();
        await account.save();
        await recordSnapshot(userId, account);

        const t = result.trade;
        const verb = action === 'BUY' ? 'Bought' : 'Sold';
        let message = `${verb} ${t.shares} × ${symbol} at ${inr(t.price)} (total ${inr(t.totalAmount)}).`;
        if (action === 'SELL' && t.profit !== 0) {
            message += ` ${t.profit > 0 ? 'Profit' : 'Loss'}: ${inr(Math.abs(t.profit))}.`;
        }

        return NextResponse.json({ ok: true, message });
    } catch (err) {
        console.error('Paper trader order error:', err);
        return NextResponse.json({ error: 'Could not place the order. Please try again.' }, { status: 500 });
    }
}
