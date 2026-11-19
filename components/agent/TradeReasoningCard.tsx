"use client";

import React, { useState } from "react";
import { TradeExecution } from "@/lib/agent/types";
import {
    TrendingUp,
    TrendingDown,
    Newspaper,
    ShieldAlert,
    Target,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Sparkles,
    HelpCircle,
    CheckCircle2,
    Clock,
    Zap,
    Scale
} from "lucide-react";

interface TradeReasoningCardProps {
    trade: TradeExecution;
    isLatest?: boolean;
    defaultExpanded?: boolean;
}

export default function TradeReasoningCard({
    trade,
    isLatest = false,
    defaultExpanded = false,
}: TradeReasoningCardProps) {
    // Collapsed by default as requested: only reveals why it did that when clicked
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { reasoning, action, symbol, name, price, shares, totalAmount, currency, timestamp, realizedPnL, realizedPnLPercent } = trade;

    const isBuy = action === "BUY";

    return (
        <div
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                    ? "border-amber-400/50 bg-[#171717] shadow-xl shadow-amber-400/5"
                    : "border-white/10 bg-[#141414] hover:border-white/20 hover:bg-[#181818]"
            }`}
        >
            {/* Clickable Summary Row - Clicking anywhere toggles the 'why did it do that' view */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsExpanded(!isExpanded);
                    }
                }}
                className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
            >
                {/* Left section: Action badge, Symbol, Company, and Recency */}
                <div className="flex items-center gap-3.5 min-w-0">
                    {/* Action Icon Badge */}
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold border transition-transform ${
                            isBuy
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                    >
                        {isBuy ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-extrabold text-white tracking-wide">
                                {symbol}
                            </span>

                            <span
                                className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                    isBuy
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                            >
                                {action}
                            </span>

                            {isLatest && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    Latest Trade
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-0.5">
                            <span className="truncate">{name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400 shrink-0">
                                <Clock className="h-3 w-3" />
                                {timestamp}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right section: Financial details & "Why did it do that?" trigger button */}
                <div className="flex items-center justify-between md:justify-end gap-5">
                    {/* Numbers: Quantity, Price, Total, and Realized Gain */}
                    <div className="text-left md:text-right">
                        <div className="text-xs text-slate-400">
                            {shares} {shares === 1 ? "share" : "shares"} @ {currency}{price.toLocaleString()}
                        </div>
                        <div className="text-sm font-bold text-white tracking-tight">
                            Total: {currency}{totalAmount.toLocaleString()}
                        </div>
                        {realizedPnL !== undefined && (
                            <div
                                className={`text-xs font-semibold ${
                                    realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                                }`}
                            >
                                P&L: {realizedPnL >= 0 ? "+" : ""}{currency}{realizedPnL.toLocaleString()}
                                {realizedPnLPercent !== undefined && ` (${realizedPnLPercent >= 0 ? "+" : ""}${realizedPnLPercent}%)`}
                            </div>
                        )}
                    </div>

                    {/* Interactive Click Prompt Pill */}
                    <div
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 ${
                            isExpanded
                                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                                : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                            {isExpanded ? "Hide Reason" : "Why did it do that?"}
                        </span>
                        <span className="sm:hidden">
                            {isExpanded ? "Hide" : "Why?"}
                        </span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                </div>
            </div>

            {/* Expanded "Why Did It Do That?" Content - Only displayed upon click */}
            {isExpanded && (
                <div className="border-t border-white/10 bg-[#121212] p-5 sm:p-6 space-y-4 animate-in fade-in-50 duration-200">
                    {/* Primary Thesis - Plain Language Summary */}
                    <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                            <Sparkles className="h-4 w-4" />
                            <span>Why the AI made this decision:</span>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                            &quot;{reasoning.thesis}&quot;
                        </p>
                    </div>

                    {/* 4 Clear Factor Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        {/* 1. News Catalyst */}
                        <div className="rounded-xl border border-white/5 bg-[#181818] p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between text-slate-400 mb-2">
                                    <span className="flex items-center gap-1.5 font-bold text-slate-200">
                                        <Newspaper className="h-3.5 w-3.5 text-amber-400" />
                                        1. News & Sentiment Catalyst
                                    </span>
                                    <span
                                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                            reasoning.sentimentScore > 0.3
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : reasoning.sentimentScore < -0.2
                                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                : "bg-white/5 text-slate-300"
                                        }`}
                                    >
                                        {reasoning.sentimentLabel} ({(reasoning.sentimentScore * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed font-medium">
                                    {reasoning.newsCatalyst}
                                </p>
                            </div>
                        </div>

                        {/* 2. Technical Trend */}
                        <div className="rounded-xl border border-white/5 bg-[#181818] p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-2">
                                    <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                                    2. Technical & Price Trend
                                </div>
                                <p className="text-slate-300 leading-relaxed font-medium">
                                    {reasoning.marketTrend}
                                </p>
                            </div>
                        </div>

                        {/* 3. Target Price (Profit Goal) */}
                        <div className="rounded-xl border border-white/5 bg-[#181818] p-4">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1.5">
                                <Target className="h-3.5 w-3.5" />
                                3. Profit Goal (Take-Profit)
                            </div>
                            <div className="text-lg font-extrabold text-white">
                                {currency}{reasoning.targetPrice.toLocaleString()}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Automatic exit level where the AI plans to close the trade and lock in profit.
                            </p>
                        </div>

                        {/* 4. Stop-Loss (Capital Protection) */}
                        <div className="rounded-xl border border-white/5 bg-[#181818] p-4">
                            <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1.5">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                4. Risk Protection (Stop-Loss)
                            </div>
                            <div className="text-lg font-extrabold text-white">
                                {currency}{reasoning.stopLoss.toLocaleString()}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Safety threshold where the AI cuts the position early to protect your principal capital.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Conviction & Capital Sizing Pill */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                            <span className="text-slate-300 font-medium">
                                {reasoning.allocationReason}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-medium">AI Confidence:</span>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                                        style={{ width: `${reasoning.confidence}%` }}
                                    />
                                </div>
                                <span className="font-extrabold text-amber-400">{reasoning.confidence}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
