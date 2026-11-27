/**
 * Shapes the AI Trader page works with. The portfolio is stored in MongoDB
 * (database/models/agentPortfolio.model.ts) and sent to the page in this form by /api/agent.
 * All money amounts are in INR.
 */

export type TradeAction = "BUY" | "SELL" | "HOLD";

export type StrategyProfile = "balanced" | "aggressive" | "value";

export interface TradeReasoning {
    thesis: string;
    newsCatalyst: string;
    /** Where the cited news came from. Only set when the article was verified against fetched news. */
    newsSource?: string;
    /** Link to the cited article. Only set when it matches an article the agent actually fetched. */
    newsUrl?: string;
    marketTrend: string;
    sentimentScore: number; // -1.0 to 1.0
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
    currency: string;
    shares: number;
    averageBuyPrice: number;
    currentPrice: number;
    /** ISO time of the last trade behind `currentPrice`. */
    priceUpdatedAt?: string;
    totalCost: number;
    currentValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    targetPrice: number;
    stopLoss: number;
    thesis: string;
    boughtAt: string;
}

export interface TradeExecution {
    id: string;
    /** Display time, formatted in the viewer's locale. */
    timestamp: string;
    timestampMs: number;
    action: "BUY" | "SELL";
    symbol: string;
    name: string;
    price: number;
    shares: number;
    totalAmount: number;
    currency: string;
    realizedPnL?: number;
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
    /** Share of closed (SELL) trades that made a profit, in percent. */
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
    /** Display time, formatted in the viewer's locale. */
    timestamp: string;
}

/** What /api/agent returns: the portfolio and the thought log of the last cycle. */
export interface AgentState {
    portfolio: PaperPortfolio;
    thoughts: AgentThoughtStep[];
}

export interface AgentCycleResponse extends AgentState {
    tradesExecuted: number;
    decisionSource: "gemini" | "unavailable";
    summary: string;
}
