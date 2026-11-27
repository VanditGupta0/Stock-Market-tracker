import { Schema, model, models, type Document, type Model } from 'mongoose';
import type { StrategyProfile } from '@/lib/agent/types';

/**
 * The AI Trader agent's portfolio. Separate from the Paper Trader's account: one per user.
 * All money amounts are in INR.
 */

export interface IAgentReasoning {
    thesis: string;
    newsCatalyst: string;
    newsSource?: string;
    newsUrl?: string;
    marketTrend: string;
    sentimentScore: number;
    sentimentLabel: string;
    riskAssessment: string;
    allocationReason: string;
    targetPrice: number;
    stopLoss: number;
    confidence: number;
}

export interface IAgentTrade {
    id: string;
    executedAt: Date;
    action: 'BUY' | 'SELL';
    symbol: string;
    name: string;
    price: number;
    shares: number;
    totalAmount: number;
    currency: string;
    realizedPnL?: number;
    realizedPnLPercent?: number;
    reasoning: IAgentReasoning;
}

export interface IAgentPosition {
    symbol: string;
    name: string;
    sector: string;
    currency: string;
    shares: number;
    averageBuyPrice: number;
    currentPrice: number;
    /** When `currentPrice` last traded on the exchange. */
    priceUpdatedAt?: Date;
    totalCost: number;
    targetPrice: number;
    stopLoss: number;
    thesis: string;
    boughtAt: Date;
}

export interface IAgentThought {
    step: number;
    phase: 'Ingestion' | 'Analysis' | 'Valuation' | 'Risk Sizing' | 'Execution';
    message: string;
    at: Date;
}

export interface AgentPortfolioDoc extends Document {
    userId: string;
    totalCapital: number;
    cash: number;
    realizedPnL: number;
    totalTrades: number;
    winningTrades: number;
    closedTrades: number;
    strategy: StrategyProfile;
    positions: IAgentPosition[];
    tradeHistory: IAgentTrade[];
    lastThoughts: IAgentThought[];
    lastCycleAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReasoningSchema = new Schema(
    {
        thesis: { type: String, required: true },
        newsCatalyst: { type: String, required: true },
        newsSource: { type: String },
        newsUrl: { type: String },
        marketTrend: { type: String, default: '' },
        sentimentScore: { type: Number, default: 0 },
        sentimentLabel: { type: String, default: 'Neutral' },
        riskAssessment: { type: String, default: '' },
        allocationReason: { type: String, default: '' },
        targetPrice: { type: Number, default: 0 },
        stopLoss: { type: Number, default: 0 },
        confidence: { type: Number, default: 50 },
    },
    { _id: false }
);

const TradeSchema = new Schema(
    {
        id: { type: String, required: true },
        executedAt: { type: Date, required: true, default: Date.now },
        action: { type: String, enum: ['BUY', 'SELL'], required: true },
        symbol: { type: String, required: true, uppercase: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        shares: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        currency: { type: String, default: '₹' },
        realizedPnL: { type: Number },
        realizedPnLPercent: { type: Number },
        reasoning: { type: ReasoningSchema, required: true },
    },
    { _id: false }
);

const PositionSchema = new Schema(
    {
        symbol: { type: String, required: true, uppercase: true },
        name: { type: String, required: true },
        sector: { type: String, default: '' },
        currency: { type: String, default: '₹' },
        shares: { type: Number, required: true },
        averageBuyPrice: { type: Number, required: true },
        currentPrice: { type: Number, required: true },
        priceUpdatedAt: { type: Date },
        totalCost: { type: Number, required: true },
        targetPrice: { type: Number, default: 0 },
        stopLoss: { type: Number, default: 0 },
        thesis: { type: String, default: '' },
        boughtAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ThoughtSchema = new Schema(
    {
        step: { type: Number, required: true },
        phase: {
            type: String,
            enum: ['Ingestion', 'Analysis', 'Valuation', 'Risk Sizing', 'Execution'],
            required: true,
        },
        message: { type: String, required: true },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const AgentPortfolioSchema = new Schema<AgentPortfolioDoc>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        totalCapital: { type: Number, required: true, default: 100000 },
        cash: { type: Number, required: true, default: 100000 },
        realizedPnL: { type: Number, default: 0 },
        totalTrades: { type: Number, default: 0 },
        winningTrades: { type: Number, default: 0 },
        closedTrades: { type: Number, default: 0 },
        strategy: { type: String, enum: ['balanced', 'aggressive', 'value'], default: 'balanced' },
        positions: { type: [PositionSchema], default: [] },
        tradeHistory: { type: [TradeSchema], default: [] },
        lastThoughts: { type: [ThoughtSchema], default: [] },
        lastCycleAt: { type: Date },
    },
    // Two cycles running at once would both read the same cash. With optimistic concurrency the
    // second save fails with a VersionError instead of overwriting the first.
    { timestamps: true, optimisticConcurrency: true }
);

export const AgentPortfolio: Model<AgentPortfolioDoc> =
    (models?.AgentPortfolio as Model<AgentPortfolioDoc>) ||
    model<AgentPortfolioDoc>('AgentPortfolio', AgentPortfolioSchema);
