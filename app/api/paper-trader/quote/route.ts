import { NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { PaperTrader } from '@/database/models/paperTrader.model';
import { PAPER_TRADER_UNIVERSE } from '@/lib/paper-trader/universe';
import { QUOTE_SOURCE_LABEL, getLiveQuote } from '@/lib/market/liveQuotes';

/** Live price for one stock, shown in the trade form before the user confirms. */
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const symbol = (new URL(request.url).searchParams.get('symbol') ?? '').trim().toUpperCase();
        if (!symbol) return NextResponse.json({ error: 'Missing symbol.' }, { status: 400 });

        // Only the tradable list or stocks the user holds, so this can't be used as a general price proxy.
        let allowed = PAPER_TRADER_UNIVERSE.some((s) => s.symbol === symbol);
        if (!allowed) {
            await connectToDatabase();
            const account = await PaperTrader.findOne({ userId: session.user.id }).lean();
            allowed = !!account?.positions.some((p) => p.symbol.toUpperCase() === symbol);
        }
        if (!allowed) return NextResponse.json({ error: 'Stock not available.' }, { status: 400 });

        const quote = await getLiveQuote(symbol);
        if (!quote) {
            return NextResponse.json({ error: 'No live price available right now.' }, { status: 502 });
        }

        return NextResponse.json({
            symbol,
            price: quote.priceInInr,
            asOf: quote.asOf.toISOString(),
            changePercent: quote.changePercent,
            sourceLabel: QUOTE_SOURCE_LABEL[quote.source],
        });
    } catch (err) {
        console.error('Paper trader quote error:', err);
        return NextResponse.json({ error: 'Could not load the price.' }, { status: 500 });
    }
}
