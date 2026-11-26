import type { PaperTraderDoc, IPaperTrade } from '@/database/models/paperTrader.model';

export interface RiskSettings {
    enabled: boolean;
    stopLossPercent: number;
    takeProfitPercent: number;
}

export const DEFAULT_RISK_SETTINGS: RiskSettings = {
    enabled: true,
    stopLossPercent: 5,
    takeProfitPercent: 10,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Stop-loss and take-profit prices for a position bought at `entryPrice`. */
export function levelsFor(entryPrice: number, settings: RiskSettings) {
    return {
        stopLoss: round2(entryPrice * (1 - settings.stopLossPercent / 100)),
        targetPrice: round2(entryPrice * (1 + settings.takeProfitPercent / 100)),
    };
}

/**
 * Closes every open position whose price has crossed its stop-loss or take-profit level.
 * Mutates `account` (positions, cash, profit counters, trade history) and returns the new trades.
 * The caller is responsible for calling account.save().
 */
export function applyRiskRules(account: PaperTraderDoc, settings: RiskSettings): IPaperTrade[] {
    if (!settings.enabled) return [];

    const closedTrades: IPaperTrade[] = [];

    for (let i = account.positions.length - 1; i >= 0; i--) {
        const pos = account.positions[i];

        const hitStop = pos.stopLoss > 0 && pos.currentPrice <= pos.stopLoss;
        const hitTarget = !hitStop && pos.targetPrice > 0 && pos.currentPrice >= pos.targetPrice;
        if (!hitStop && !hitTarget) continue;

        // Fills at the current price, so a gap past the level can lose/gain slightly more than set.
        const exitPrice = pos.currentPrice;
        const sellValue = round2(pos.shares * exitPrice);
        const profit = round2(sellValue - pos.costBasis);
        const profitPercent = pos.costBasis > 0 ? (profit / pos.costBasis) * 100 : 0;

        account.cash += sellValue;
        account.realizedProfit += profit;
        account.totalTrades += 1;
        if (profit > 0) account.winningTrades += 1;

        const level = hitStop ? pos.stopLoss : pos.targetPrice;
        const label = hitStop ? 'Stop-loss' : 'Take-profit';
        const verb = hitStop ? 'fell to' : 'rose to';

        const trade: IPaperTrade = {
            tradeId: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            symbol: pos.symbol,
            company: pos.company,
            action: 'SELL',
            strategy: `${label} exit`,
            shares: pos.shares,
            price: exitPrice,
            totalAmount: sellValue,
            profit,
            profitPercent,
            executedAt: new Date(),
            thoughtProcess: `${label} rule triggered automatically. The price ${verb} ₹${exitPrice.toLocaleString('en-IN')}, past your ${label.toLowerCase()} level of ₹${level.toLocaleString('en-IN')} (bought at an average of ₹${pos.avgBuyPrice.toLocaleString('en-IN')}). The whole position was closed, for a result of ${profit >= 0 ? '+' : ''}₹${profit.toLocaleString('en-IN')} (${profitPercent.toFixed(2)}%).`,
            newsCatalyst: {
                headline: `${label} triggered at ₹${level.toLocaleString('en-IN')}`,
                source: 'Risk rules',
                summary: `Position closed automatically by your ${label.toLowerCase()} rule.`,
                sentiment: 'NEUTRAL',
                impactScore: 0,
                url: '',
            },
            marketTrend: {
                trendName: `${label} level crossed`,
                indicators: [`Level: ₹${level.toLocaleString('en-IN')}`, `Exit: ₹${exitPrice.toLocaleString('en-IN')}`],
                supportResistance: `Entry avg ₹${pos.avgBuyPrice.toLocaleString('en-IN')}`,
                timeframe: 'Rule-based',
                volumeProfile: 'n/a',
            },
            confidenceScore: 100,
            riskReward: `${settings.stopLossPercent}% stop / ${settings.takeProfitPercent}% target`,
        };

        account.trades.unshift(trade);
        account.positions.splice(i, 1);
        closedTrades.push(trade);
    }

    return closedTrades;
}
