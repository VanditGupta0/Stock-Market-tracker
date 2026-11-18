import { Schema, model, models, type Document, type Model } from 'mongoose';

// --- Sub-document interfaces ---

export interface INewsCatalyst {
    headline: string;
    source: string;
    summary: string;
    sentiment: 'BULLISH' | 'VERY_BULLISH' | 'BEARISH' | 'NEUTRAL';
    impactScore: number;
    url?: string;
}

export interface IMarketTrend {
    trendName: string;
    indicators: string[];
    supportResistance: string;
    timeframe: string;
    volumeProfile: string;
}

export interface IPaperTrade {
    tradeId: string;
    symbol: string;
    company: string;
    action: 'BUY' | 'SELL';
    strategy: string;
    shares: number;
    price: number;
    totalAmount: number;
    profit: number;
    profitPercent: number;
    executedAt: Date;
    thoughtProcess: string;
    newsCatalyst: INewsCatalyst;
    marketTrend: IMarketTrend;
    confidenceScore: number;
    riskReward: string;
}

export interface IPaperPosition {
    positionId: string;
    symbol: string;
    company: string;
    shares: number;
    avgBuyPrice: number;
    currentPrice: number;
    costBasis: number;
    marketValue: number;
    unrealizedProfit: number;
    unrealizedProfitPercent: number;
    openedAt: Date;
    targetPrice: number;
    stopLoss: number;
}

// --- Main document ---

export interface PaperTraderDoc extends Document {
    userId: string;
    budget: number;
    cash: number;
    realizedProfit: number;
    totalTrades: number;
    winningTrades: number;
    positions: IPaperPosition[];
    trades: IPaperTrade[];
    lastScanAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// --- Schemas ---

const NewsCatalystSchema = new Schema(
    {
        headline: { type: String, required: true },
        source: { type: String, required: true },
        summary: { type: String, required: true },
        sentiment: {
            type: String,
            enum: ['BULLISH', 'VERY_BULLISH', 'BEARISH', 'NEUTRAL'],
            default: 'BULLISH',
        },
        impactScore: { type: Number, default: 75 },
        url: { type: String },
    },
    { _id: false }
);

const MarketTrendSchema = new Schema(
    {
        trendName: { type: String, required: true },
        indicators: [{ type: String }],
        supportResistance: { type: String, default: '' },
        timeframe: { type: String, default: 'Daily' },
        volumeProfile: { type: String, default: 'Normal' },
    },
    { _id: false }
);

const PaperTradeSchema = new Schema(
    {
        tradeId: { type: String, required: true },
        symbol: { type: String, required: true, uppercase: true },
        company: { type: String, required: true },
        action: { type: String, enum: ['BUY', 'SELL'], required: true },
        strategy: { type: String, default: 'AI Signal' },
        shares: { type: Number, required: true },
        price: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        profit: { type: Number, default: 0 },
        profitPercent: { type: Number, default: 0 },
        executedAt: { type: Date, default: Date.now },
        thoughtProcess: { type: String, required: true },
        newsCatalyst: { type: NewsCatalystSchema, required: true },
        marketTrend: { type: MarketTrendSchema, required: true },
        confidenceScore: { type: Number, default: 80 },
        riskReward: { type: String, default: '1:2' },
    },
    { _id: false }
);

const PaperPositionSchema = new Schema(
    {
        positionId: { type: String, required: true },
        symbol: { type: String, required: true, uppercase: true },
        company: { type: String, required: true },
        shares: { type: Number, required: true },
        avgBuyPrice: { type: Number, required: true },
        currentPrice: { type: Number, required: true },
        costBasis: { type: Number, required: true },
        marketValue: { type: Number, required: true },
        unrealizedProfit: { type: Number, default: 0 },
        unrealizedProfitPercent: { type: Number, default: 0 },
        openedAt: { type: Date, default: Date.now },
        targetPrice: { type: Number, default: 0 },
        stopLoss: { type: Number, default: 0 },
    },
    { _id: false }
);

const PaperTraderSchema = new Schema<PaperTraderDoc>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        budget: { type: Number, required: true, default: 100000 },
        cash: { type: Number, required: true, default: 100000 },
        realizedProfit: { type: Number, default: 0 },
        totalTrades: { type: Number, default: 0 },
        winningTrades: { type: Number, default: 0 },
        positions: { type: [PaperPositionSchema], default: [] },
        trades: { type: [PaperTradeSchema], default: [] },
        lastScanAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const PaperTrader: Model<PaperTraderDoc> =
    (models?.PaperTrader as Model<PaperTraderDoc>) ||
    model<PaperTraderDoc>('PaperTrader', PaperTraderSchema);
