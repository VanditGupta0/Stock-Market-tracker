"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    PaperPortfolio,
    StockAsset,
    StrategyProfile,
    AgentThoughtStep,
    TradeExecution,
} from "@/lib/agent/types";
import {
    loadPortfolioFromStorage,
    savePortfolioToStorage,
    resetPortfolio,
} from "@/lib/agent/portfolioStore";
import { getStockUniverse } from "@/lib/agent/marketUniverse";
import { runAgentTradingCycle } from "@/lib/agent/reasoningEngine";
import { MARKET_NEWS } from "@/lib/constants";
import TradeReasoningCard from "@/components/agent/TradeReasoningCard";
import CapitalModal from "@/components/agent/CapitalModal";
import ThoughtStream from "@/components/agent/ThoughtStream";
import BreakingNewsSimulator from "@/components/agent/BreakingNewsSimulator";
import {
    Bot,
    Coins,
    RefreshCw,
    Play,
    Pause,
    TrendingUp,
    TrendingDown,
    PieChart,
    RotateCcw,
    Sparkles,
    ShieldCheck,
    Layers,
    DollarSign,
    Target,
    Search,
    Info,
    SlidersHorizontal,
    ListFilter
} from "lucide-react";

export default function AgentPage() {
    const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
    const [stocks, setStocks] = useState<StockAsset[]>([]);
    const [thoughts, setThoughts] = useState<AgentThoughtStep[]>([]);
    const [isDeliberating, setIsDeliberating] = useState<boolean>(false);
    const [autoPilot, setAutoPilot] = useState<boolean>(false);
    const [isCapitalModalOpen, setIsCapitalModalOpen] = useState<boolean>(false);
    const [tradeFilter, setTradeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Initial load
    useEffect(() => {
        const initial = loadPortfolioFromStorage(100000);
        setPortfolio(initial);
        const initialStocks = getStockUniverse();
        setStocks(initialStocks);

        // If fresh portfolio with no trades, run initial deliberation cycle
        if (initial.tradeHistory.length === 0) {
            triggerAgentCycle(initial, initialStocks, undefined);
        }
    }, []);

    // Core function to execute an agent deliberation cycle
    const triggerAgentCycle = useCallback(
        async (
            currentPortfolio?: PaperPortfolio,
            currentStocks?: StockAsset[],
            customNewsHeadline?: string
        ) => {
            const p = currentPortfolio || portfolio;
            if (!p) return;
            const s = currentStocks || getStockUniverse();

            setIsDeliberating(true);

            // Give a realistic 600ms micro-delay for animation
            await new Promise((resolve) => setTimeout(resolve, 600));

            try {
                const result = runAgentTradingCycle({
                    portfolio: p,
                    stocks: s,
                    newsArticles: MARKET_NEWS,
                    strategy: p.strategy,
                    customNewsHeadline,
                });

                setPortfolio(result.portfolio);
                setStocks(s);
                savePortfolioToStorage(result.portfolio);
                setThoughts(result.thoughts);
            } catch (err) {
                console.error("Agent deliberation failed:", err);
            } finally {
                setIsDeliberating(false);
            }
        },
        [portfolio]
    );

    // Auto-pilot timer
    const autoPilotRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (autoPilot) {
            autoPilotRef.current = setInterval(() => {
                const freshStocks = getStockUniverse();
                triggerAgentCycle(undefined, freshStocks, undefined);
            }, 25000); // cycle every 25 seconds
        } else if (autoPilotRef.current) {
            clearInterval(autoPilotRef.current);
            autoPilotRef.current = null;
        }

        return () => {
            if (autoPilotRef.current) clearInterval(autoPilotRef.current);
        };
    }, [autoPilot, triggerAgentCycle]);

    // Handle Capital assignment from modal
    const handleAssignCapital = (newCapital: number, newStrategy: StrategyProfile) => {
        const fresh = resetPortfolio(newCapital, newStrategy);
        setPortfolio(fresh);
        const freshStocks = getStockUniverse();
        setStocks(freshStocks);
        setThoughts([]);
        triggerAgentCycle(fresh, freshStocks, undefined);
    };

    // Manual reset
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your Paper Trading account? All current positions and trades will be wiped.")) {
            const capital = portfolio?.totalCapital || 100000;
            const strat = portfolio?.strategy || "balanced";
            const fresh = resetPortfolio(capital, strat);
            setPortfolio(fresh);
            setThoughts([]);
        }
    };

    if (!portfolio) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-amber-400">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="text-sm font-semibold">Initializing Apex AI Trader...</span>
                </div>
            </div>
        );
    }

    const currencySymbol = portfolio.positions[0]?.currency || "₹";
    const isProfitable = portfolio.totalPnL >= 0;

    const getTradeTime = (trade: TradeExecution): number => {
        if (trade.timestampMs) return trade.timestampMs;
        const match = trade.id.match(/trade-(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        return 0;
    };

    // Strictly sort so the topmost trade is guaranteed to be the most recent one
    const sortedTrades = [...portfolio.tradeHistory].sort((a, b) => getTradeTime(b) - getTradeTime(a));

    const filteredTrades = sortedTrades.filter((trade) => {
        const matchesFilter = tradeFilter === "ALL" || trade.action === tradeFilter;
        const matchesSearch =
            !searchQuery.trim() ||
            trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trade.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen space-y-8 pb-16">
            {/* Top Command Header */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#181818] via-[#121212] to-[#0d0d0d] p-6 lg:p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Title & Status */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-lg shadow-amber-400/10">
                                <Bot className="h-7 w-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                                        Apex AI Paper Trader
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Autonomous
                                    </span>
                                </div>
                                <p className="text-xs lg:text-sm text-slate-400">
                                    Executes paper trades based on real-time news sentiment and technical trends, with complete chain-of-thought rationale.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Auto-Pilot Toggle */}
                        <button
                            onClick={() => setAutoPilot(!autoPilot)}
                            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
                                autoPilot
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/10"
                                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {autoPilot ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            <span>Auto-Pilot: {autoPilot ? "ON (25s)" : "OFF"}</span>
                        </button>

                        {/* Assign Capital */}
                        <button
                            onClick={() => setIsCapitalModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Coins className="h-4 w-4 text-amber-400" />
                            <span>Assign Capital ({currencySymbol}{portfolio.totalCapital.toLocaleString()})</span>
                        </button>

                        {/* Run Decision Cycle */}
                        <button
                            onClick={() => triggerAgentCycle()}
                            disabled={isDeliberating}
                            className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-black hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-400/20"
                        >
                            <RefreshCw className={`h-4 w-4 ${isDeliberating ? "animate-spin" : ""}`} />
                            <span>{isDeliberating ? "Deliberating..." : "Run Agent Cycle"}</span>
                        </button>

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-rose-400 transition-colors"
                            title="Reset Paper Trading Account"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Strategy Pill Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Operating Strategy:</span>
                        <span className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-bold text-amber-400 uppercase tracking-wider">
                            {portfolio.strategy} Mode
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <span>Max Position Cap: <strong className="text-white">22%</strong></span>
                        <span>•</span>
                        <span>Stop-Loss Protocol: <strong className="text-rose-400">-4.0%</strong></span>
                        <span>•</span>
                        <span>Profit Objective: <strong className="text-emerald-400">+11.0%</strong></span>
                    </div>
                </div>
            </div>

            {/* Portfolio Summary Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Worth */}
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Net Worth</span>
                        <PieChart className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                        {currencySymbol}{portfolio.currentValue.toLocaleString()}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
                        <span
                            className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 ${
                                isProfitable ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            }`}
                        >
                            {isProfitable ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {isProfitable ? "+" : ""}{portfolio.totalPnLPercent}%
                        </span>
                        <span className="text-slate-400">
                            ({isProfitable ? "+" : ""}{currencySymbol}{portfolio.totalPnL.toLocaleString()})
                        </span>
                    </div>
                </div>

                {/* Available Cash vs Invested */}
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Available Cash</span>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                        {currencySymbol}{portfolio.cash.toLocaleString()}
                    </div>
                    <div className="mt-2">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Invested: {currencySymbol}{portfolio.investedCapital.toLocaleString()}</span>
                            <span>{((portfolio.investedCapital / portfolio.totalCapital) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-amber-400"
                                style={{ width: `${Math.min(100, (portfolio.investedCapital / portfolio.totalCapital) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Realized P&L */}
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Realized P&L</span>
                        <Target className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div
                        className={`text-2xl font-bold tracking-tight ${
                            portfolio.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                        {portfolio.realizedPnL >= 0 ? "+" : ""}{currencySymbol}{portfolio.realizedPnL.toLocaleString()}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                        From completed roundtrip sales
                    </p>
                </div>

                {/* Win Rate & Total Trades */}
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Win Rate & Volume</span>
                        <ShieldCheck className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                        {portfolio.winRate}%
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                        {portfolio.totalTrades} trade(s) executed ({portfolio.winningTrades} profitable)
                    </p>
                </div>
            </div>

            {/* Core Section: Trades & Decision History (Topmost is most recent) */}
            <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-md">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-lg font-bold text-white tracking-tight">
                                        Trades & AI Decision History
                                    </h2>
                                    <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-xs font-bold text-amber-400">
                                        {sortedTrades.length} Total
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Showing all trades with the topmost being the most recent. Click any trade to see why the AI did that.
                                </p>
                            </div>
                        </div>

                        {/* Filter Tabs: All, Buys, Sells */}
                        <div className="flex items-center gap-1.5 bg-[#1b1b1b] p-1 rounded-xl border border-white/5 self-start md:self-auto">
                            <button
                                onClick={() => setTradeFilter("ALL")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                    tradeFilter === "ALL"
                                        ? "bg-amber-400 text-black shadow-md"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                All ({sortedTrades.length})
                            </button>
                            <button
                                onClick={() => setTradeFilter("BUY")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                    tradeFilter === "BUY"
                                        ? "bg-emerald-500 text-white shadow-md"
                                        : "text-slate-400 hover:text-emerald-400"
                                }`}
                            >
                                Buys ({sortedTrades.filter(t => t.action === "BUY").length})
                            </button>
                            <button
                                onClick={() => setTradeFilter("SELL")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                    tradeFilter === "SELL"
                                        ? "bg-rose-500 text-white shadow-md"
                                        : "text-slate-400 hover:text-rose-400"
                                }`}
                            >
                                Sells ({sortedTrades.filter(t => t.action === "SELL").length})
                            </button>
                        </div>
                    </div>

                    {/* Search Bar & Interactive Prompt */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search trades by stock symbol (e.g. RELIANCE, TCS, INFY)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                            <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>Click any trade to reveal its thesis, news catalyst, and targets.</span>
                        </div>
                    </div>
                </div>

                {/* Trade Items List */}
                {filteredTrades.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#141414] p-10 text-center text-slate-400">
                        <Bot className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                        <h3 className="text-base font-semibold text-white">
                            {sortedTrades.length === 0 ? "No Trades Recorded Yet" : "No Trades Match Your Filter"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {sortedTrades.length === 0
                                ? 'Click "Run Agent Cycle" above to let the AI analyze the market and execute its first trades.'
                                : "Try clearing your search query or selecting 'All Trades' above."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTrades.map((trade, idx) => (
                            <TradeReasoningCard
                                key={trade.id}
                                trade={trade}
                                isLatest={idx === 0 && tradeFilter === "ALL" && !searchQuery.trim()}
                                defaultExpanded={false}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Interactive News Catalyst Simulator */}
            <BreakingNewsSimulator
                onInjectNews={(headline) => triggerAgentCycle(undefined, undefined, headline)}
                isRunning={isDeliberating}
            />

            {/* Current Open Positions Table */}
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 lg:p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white tracking-tight">
                                Current Active Holdings ({portfolio.positions.length})
                            </h3>
                            <p className="text-xs text-slate-400">
                                Real-time valuation and stop-loss targets of open paper positions
                            </p>
                        </div>
                    </div>
                </div>

                {portfolio.positions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                        No active open positions. Cash is 100% liquid.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-3">Asset</th>
                                    <th className="py-3 px-3">Sector</th>
                                    <th className="py-3 px-3">Shares</th>
                                    <th className="py-3 px-3">Avg Price</th>
                                    <th className="py-3 px-3">Live Price</th>
                                    <th className="py-3 px-3">Current Value</th>
                                    <th className="py-3 px-3">Unrealized P&L</th>
                                    <th className="py-3 px-3">Target / Stop</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {portfolio.positions.map((pos) => {
                                    const isPosProfitable = pos.unrealizedPnL >= 0;
                                    return (
                                        <tr key={pos.symbol} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-3">
                                                <div className="font-bold text-white text-sm">{pos.symbol}</div>
                                                <div className="text-[11px] text-slate-400">{pos.name}</div>
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-300">
                                                {pos.sector}
                                            </td>
                                            <td className="py-3.5 px-3 font-semibold text-white">
                                                {pos.shares}
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-300">
                                                {pos.currency}{pos.averageBuyPrice.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-3 font-bold text-white">
                                                {pos.currency}{pos.currentPrice.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-3 font-bold text-white">
                                                {pos.currency}{pos.currentValue.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                                                        isPosProfitable
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                    }`}
                                                >
                                                    {isPosProfitable ? "+" : ""}{pos.currency}{pos.unrealizedPnL.toLocaleString()} ({isPosProfitable ? "+" : ""}{pos.unrealizedPnLPercent}%)
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-[11px]">
                                                <div className="text-emerald-400 font-medium">TP: {pos.currency}{pos.targetPrice.toLocaleString()}</div>
                                                <div className="text-rose-400 font-medium">SL: {pos.currency}{pos.stopLoss.toLocaleString()}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Agent Deliberation Monologue & Audit Log */}
            <ThoughtStream thoughts={thoughts} isRunning={isDeliberating} />

            {/* Capital Configuration Modal */}
            <CapitalModal
                isOpen={isCapitalModalOpen}
                onClose={() => setIsCapitalModalOpen(false)}
                currentCapital={portfolio.totalCapital}
                currentStrategy={portfolio.strategy}
                onConfirm={handleAssignCapital}
            />
        </div>
    );
}
