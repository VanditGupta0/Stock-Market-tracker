import type { AgentPortfolioDoc } from '@/database/models/agentPortfolio.model';
import type { AgentState, PaperPortfolio, Position, TradeExecution } from './types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Turns the stored agent portfolio into the plain JSON the page renders. Times are sent as ISO
 * strings in `timestamp`; the page reformats them in the viewer's locale.
 */
export function serializeAgentState(doc: AgentPortfolioDoc): AgentState {
    const positions: Position[] = doc.positions.map((p) => {
        const currentValue = round2(p.shares * p.currentPrice);
        const unrealizedPnL = round2(currentValue - p.totalCost);
        return {
            symbol: p.symbol,
            name: p.name,
            sector: p.sector,
            currency: p.currency,
            shares: p.shares,
            averageBuyPrice: p.averageBuyPrice,
            currentPrice: p.currentPrice,
            priceUpdatedAt: p.priceUpdatedAt ? new Date(p.priceUpdatedAt).toISOString() : undefined,
            totalCost: p.totalCost,
            currentValue,
            unrealizedPnL,
            unrealizedPnLPercent: p.totalCost > 0 ? round2((unrealizedPnL / p.totalCost) * 100) : 0,
            targetPrice: p.targetPrice,
            stopLoss: p.stopLoss,
            thesis: p.thesis,
            boughtAt: new Date(p.boughtAt).toISOString(),
        };
    });

    const tradeHistory: TradeExecution[] = doc.tradeHistory.map((t) => {
        const at = new Date(t.executedAt);
        return {
            id: t.id,
            timestamp: at.toISOString(),
            timestampMs: at.getTime(),
            action: t.action,
            symbol: t.symbol,
            name: t.name,
            price: t.price,
            shares: t.shares,
            totalAmount: t.totalAmount,
            currency: t.currency,
            realizedPnL: t.realizedPnL ?? undefined,
            realizedPnLPercent: t.realizedPnLPercent ?? undefined,
            reasoning: {
                thesis: t.reasoning.thesis,
                newsCatalyst: t.reasoning.newsCatalyst,
                newsSource: t.reasoning.newsSource || undefined,
                newsUrl: t.reasoning.newsUrl || undefined,
                marketTrend: t.reasoning.marketTrend,
                sentimentScore: t.reasoning.sentimentScore,
                sentimentLabel: t.reasoning.sentimentLabel,
                riskAssessment: t.reasoning.riskAssessment,
                allocationReason: t.reasoning.allocationReason,
                targetPrice: t.reasoning.targetPrice,
                stopLoss: t.reasoning.stopLoss,
                confidence: t.reasoning.confidence,
            },
        };
    });

    const investedCapital = round2(positions.reduce((sum, p) => sum + p.currentValue, 0));
    const currentValue = round2(doc.cash + investedCapital);
    const totalPnL = round2(currentValue - doc.totalCapital);

    const portfolio: PaperPortfolio = {
        totalCapital: doc.totalCapital,
        cash: round2(doc.cash),
        investedCapital,
        currentValue,
        totalPnL,
        totalPnLPercent: doc.totalCapital > 0 ? round2((totalPnL / doc.totalCapital) * 100) : 0,
        realizedPnL: round2(doc.realizedPnL),
        winRate: doc.closedTrades > 0 ? Math.round((doc.winningTrades / doc.closedTrades) * 1000) / 10 : 0,
        totalTrades: doc.totalTrades,
        winningTrades: doc.winningTrades,
        strategy: doc.strategy,
        positions,
        tradeHistory,
        lastUpdated: (doc.lastCycleAt ?? doc.updatedAt ?? new Date()).toISOString(),
    };

    return {
        portfolio,
        thoughts: doc.lastThoughts.map((t) => ({
            step: t.step,
            phase: t.phase,
            message: t.message,
            timestamp: new Date(t.at).toISOString(),
        })),
    };
}
