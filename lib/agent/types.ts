import { NewsArticle } from "@/lib/constants";

export type TradeAction = "BUY" | "SELL" | "HOLD";

export type StrategyProfile = "balanced" | "aggressive" | "value";

export interface StockAsset {
    symbol: string;
    name: string;
    sector: string;
    currency: string;
    price: number;
    change: number;
    percentChange: number;
    peRatio: number;
    marketCap: string;
    trend: "Strong Uptrend" | "Bullish" | "Neutral" | "Bearish" | "Strong Downtrend";
    rsi: number;
    movingAverage50: number;
    movingAverage200: number;
    volume24h: string;
    sentimentScore: number; // -1.0 to 1.0
    sentimentLabel: "Strongly Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strongly Bearish";
    catalystSummary: string;
    relatedNewsIds: string[];
}

export interface TradeReasoning {
    thesis: string;
    newsCatalyst: string;
    marketTrend: string;
    sentimentScore: number;
    sentimentLabel: string;
    riskAssessment: string;
    allocationReason: string;
    targetPrice: number;
    stopLoss: number;
    confidence: number; // 0 - 100
}

export interface Position {
    symbol: string;
    name: string;
    sector: string;
    currency: string; // quote currency of the stock (applies to per-share prices)
    shares: number;
    averageBuyPrice: number; // in `currency`
    currentPrice: number; // in `currency`
    totalCost: number; // INR (portfolio base)
    currentValue: number; // INR (portfolio base)
    unrealizedPnL: number; // INR (portfolio base)
    unrealizedPnLPercent: number;
    targetPrice: number;
    stopLoss: number;
    thesis: string;
    boughtAt: string;
}

export interface TradeExecution {
    id: string;
    timestamp: string;
    timestampMs?: number;
    action: "BUY" | "SELL";
    symbol: string;
    name: string;
    price: number; // in `currency`
    shares: number;
    totalAmount: number; // INR (portfolio base)
    currency: string; // quote currency of the stock
    realizedPnL?: number; // INR (portfolio base)
    realizedPnLPercent?: number;
    reasoning: TradeReasoning;
}

export interface PaperPortfolio {
    totalCapital: number;
    cash: number;
    investedCapital: number;
    currentValue: number;
    totalPnL: number;
    totalPnLPercent: number;
    realizedPnL: number;
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    strategy: StrategyProfile;
    positions: Position[];
    tradeHistory: TradeExecution[];
    lastUpdated: string;
}

export interface AgentThoughtStep {
    step: number;
    phase: "Ingestion" | "Analysis" | "Valuation" | "Risk Sizing" | "Execution";
    message: string;
    timestamp: string;
}

export interface AgentCycleResult {
    cycleId: string;
    timestamp: string;
    marketSentimentSummary: "Bullish" | "Neutral" | "Bearish";
    thoughts: AgentThoughtStep[];
    tradesExecuted: TradeExecution[];
    portfolio: PaperPortfolio;
    summary: string;
}
