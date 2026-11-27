import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';
import { auth } from '@/lib/better-auth/auth';
import { connectToDatabase } from '@/database/mongoose';
import { AgentPortfolio, type AgentPortfolioDoc } from '@/database/models/agentPortfolio.model';
import { runAgentCycle } from '@/lib/agent/engine';
import { serializeAgentState } from '@/lib/agent/serialize';
import { isStrategy } from '@/lib/agent/strategy';
import type { AgentCycleResponse } from '@/lib/agent/types';

/**
 * The AI Trader agent's portfolio, stored in MongoDB per user.
 *   GET  -> the portfolio and the last cycle's thought log (created on first visit)
 *   POST -> run one agent cycle; body: { breakingNews?: string }
 *   PUT  -> reset the portfolio with new capital and strategy; body: { capital, strategy }
 */

const DEFAULT_CAPITAL = 100000;
const MIN_CAPITAL = 1000;
const MAX_CAPITAL = 100_000_000;

async function getUserId(): Promise<string | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
}

async function getOrCreatePortfolio(userId: string): Promise<AgentPortfolioDoc> {
    const existing = await AgentPortfolio.findOne({ userId });
    if (existing) return existing;
    try {
        return await AgentPortfolio.create({ userId, totalCapital: DEFAULT_CAPITAL, cash: DEFAULT_CAPITAL });
    } catch (err) {
        // Two first requests at once: the other one created it.
        if ((err as { code?: number }).code === 11000) {
            const doc = await AgentPortfolio.findOne({ userId });
            if (doc) return doc;
        }
        throw err;
    }
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
    try {
        const body = await request.json();
        return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    } catch {
        return {};
    }
}

export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const doc = await getOrCreatePortfolio(userId);
        return NextResponse.json(serializeAgentState(doc));
    } catch (err) {
        console.error('AI Trader GET error:', err);
        return NextResponse.json({ error: 'Failed to load the AI Trader portfolio.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await readJson(request);
        const breakingNews = typeof body.breakingNews === 'string' ? body.breakingNews : undefined;

        await connectToDatabase();
        const doc = await getOrCreatePortfolio(userId);
        const result = await runAgentCycle(doc, { breakingNews });

        try {
            await doc.save();
        } catch (err) {
            if (err instanceof mongoose.Error.VersionError) {
                return NextResponse.json(
                    { error: 'Another agent cycle finished first. Its trades were kept and this one was discarded.' },
                    { status: 409 }
                );
            }
            throw err;
        }

        const response: AgentCycleResponse = { ...serializeAgentState(doc), ...result };
        return NextResponse.json(response);
    } catch (err) {
        console.error('AI Trader cycle error:', err);
        return NextResponse.json({ error: 'The agent cycle failed. Please try again.' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await readJson(request);
        const capital = Number(body.capital);
        if (!Number.isFinite(capital) || capital < MIN_CAPITAL || capital > MAX_CAPITAL) {
            return NextResponse.json(
                { error: `Capital must be between ₹${MIN_CAPITAL.toLocaleString('en-IN')} and ₹${MAX_CAPITAL.toLocaleString('en-IN')}.` },
                { status: 400 }
            );
        }
        const strategy = isStrategy(body.strategy) ? body.strategy : 'balanced';

        await connectToDatabase();
        const doc = await AgentPortfolio.findOneAndUpdate(
            { userId },
            {
                $set: {
                    totalCapital: Math.round(capital * 100) / 100,
                    cash: Math.round(capital * 100) / 100,
                    strategy,
                    realizedPnL: 0,
                    totalTrades: 0,
                    winningTrades: 0,
                    closedTrades: 0,
                    positions: [],
                    tradeHistory: [],
                    lastThoughts: [],
                },
                $unset: { lastCycleAt: 1 },
                // A reset must also invalidate any cycle that is running right now.
                $inc: { __v: 1 },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return NextResponse.json(serializeAgentState(doc));
    } catch (err) {
        console.error('AI Trader reset error:', err);
        return NextResponse.json({ error: 'Failed to reset the AI Trader portfolio.' }, { status: 500 });
    }
}
