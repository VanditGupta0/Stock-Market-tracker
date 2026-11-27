import type { StrategyProfile } from './types';

/**
 * Risk limits for each strategy. The engine enforces these in code; Gemini is told about
 * them but is never trusted to follow them.
 */
export interface StrategyConfig {
    /** Largest share of total capital one stock may hold, in percent. */
    maxPositionPercent: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    /** Tells Gemini what kind of setups this strategy looks for. */
    promptGuidance: string;
}

export const STRATEGIES: Record<StrategyProfile, StrategyConfig> = {
    balanced: {
        maxPositionPercent: 22,
        stopLossPercent: 4,
        takeProfitPercent: 11,
        promptGuidance:
            'Balanced: weigh news sentiment and price momentum about equally, and prefer liquid leaders with a clear catalyst.',
    },
    aggressive: {
        maxPositionPercent: 28,
        stopLossPercent: 5,
        takeProfitPercent: 14,
        promptGuidance:
            'Aggressive: favour strong momentum and high-impact news, and accept more volatility for larger moves.',
    },
    value: {
        maxPositionPercent: 22,
        stopLossPercent: 4,
        takeProfitPercent: 8,
        promptGuidance:
            'Value: favour quality companies that have pulled back or trade flat, avoid chasing big one-day spikes, and take profits early.',
    },
};

/** Each BUY must use between these shares of the cash available at the time of the trade. */
export const MIN_BUY_CASH_PERCENT = 10;
export const MAX_BUY_CASH_PERCENT = 25;

/** Most Gemini trades executed in one cycle (stop-loss / take-profit exits don't count). */
export const MAX_TRADES_PER_CYCLE = 3;

export const isStrategy = (v: unknown): v is StrategyProfile =>
    v === 'balanced' || v === 'aggressive' || v === 'value';
