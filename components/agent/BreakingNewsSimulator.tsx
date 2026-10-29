"use client";

import React, { useState } from "react";
import { NewsArticle } from "@/lib/constants";
import { PRESET_BREAKING_NEWS } from "@/lib/agent/marketUniverse";
import { Flame, Send, Sparkles, Newspaper } from "lucide-react";

interface BreakingNewsSimulatorProps {
    onInjectNews: (headline: string) => void;
    isRunning: boolean;
}

export default function BreakingNewsSimulator({ onInjectNews, isRunning }: BreakingNewsSimulatorProps) {
    const [customHeadline, setCustomHeadline] = useState("");

    const handlePresetClick = (article: NewsArticle) => {
        onInjectNews(article.title);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customHeadline.trim()) return;
        onInjectNews(customHeadline.trim());
        setCustomHeadline("");
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Flame className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">Live News & Catalyst Simulator</h3>
                        <p className="text-[11px] text-slate-400">Feed custom breaking news to trigger immediate autonomous agent decisions</p>
                    </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    Active Wire
                </span>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="mt-4 flex gap-2">
                <div className="relative flex-1">
                    <Newspaper className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={customHeadline}
                        onChange={(e) => setCustomHeadline(e.target.value)}
                        placeholder="Type any breaking market headline (e.g. 'Apple unveils breakthrough battery for EVs')..."
                        className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        disabled={isRunning}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isRunning || !customHeadline.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Inject & Trade</span>
                </button>
            </form>

            {/* Preset Breaking Headlines */}
            <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Or select a live scenario to test agent reaction:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PRESET_BREAKING_NEWS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handlePresetClick(item)}
                            disabled={isRunning}
                            className="group flex flex-col items-start rounded-xl border border-white/5 bg-[#181818] p-2.5 text-left hover:border-amber-400/40 hover:bg-[#202020] transition-all disabled:opacity-50"
                        >
                            <div className="flex w-full items-center justify-between text-[10px] text-slate-400 mb-1">
                                <span className="font-semibold text-amber-400/90">{item.source}</span>
                                <span
                                    className={`rounded px-1 py-0.2 font-semibold ${
                                        item.sentiment === "Bullish"
                                            ? "text-emerald-400 bg-emerald-500/10"
                                            : "text-rose-400 bg-rose-500/10"
                                    }`}
                                >
                                    {item.sentiment}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-2">
                                {item.title}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
