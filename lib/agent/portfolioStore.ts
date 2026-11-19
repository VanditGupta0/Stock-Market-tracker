import { PaperPortfolio, StrategyProfile } from "./types";

const STORAGE_KEY = "signalist_agent_portfolio_v1";

export function createInitialPortfolio(initialCapital: number = 100000, strategy: StrategyProfile = "balanced"): PaperPortfolio {
    return {
        totalCapital: initialCapital,
        cash: initialCapital,
        investedCapital: 0,
        currentValue: initialCapital,
        totalPnL: 0,
        totalPnLPercent: 0,
        realizedPnL: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
        strategy,
        positions: [],
        tradeHistory: [],
        lastUpdated: new Date().toLocaleTimeString(),
    };
}

export function loadPortfolioFromStorage(defaultCapital: number = 100000): PaperPortfolio {
    if (typeof window === "undefined") {
        return createInitialPortfolio(defaultCapital);
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as PaperPortfolio;
            if (parsed && typeof parsed.totalCapital === "number") {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to parse stored portfolio:", e);
    }

    const fresh = createInitialPortfolio(defaultCapital);
    savePortfolioToStorage(fresh);
    return fresh;
}

export function savePortfolioToStorage(portfolio: PaperPortfolio): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch (e) {
        console.error("Failed to save portfolio:", e);
    }
}

export function resetPortfolio(newCapital?: number, strategy?: StrategyProfile): PaperPortfolio {
    const capital = newCapital || 100000;
    const strat = strategy || "balanced";
    const fresh = createInitialPortfolio(capital, strat);
    savePortfolioToStorage(fresh);
    return fresh;
}
