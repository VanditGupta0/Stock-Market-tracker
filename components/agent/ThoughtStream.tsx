"use client";

import React from "react";
import { AgentThoughtStep } from "@/lib/agent/types";
import { Terminal, Bot, Clock } from "lucide-react";

interface ThoughtStreamProps {
    thoughts: AgentThoughtStep[];
    isRunning: boolean;
}

export default function ThoughtStream({ thoughts, isRunning }: ThoughtStreamProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">Agent Thinking & Decision Audit Trail</h3>
                        <p className="text-[11px] text-slate-400">Step-by-step reasoning log generated during market cycles</p>
                    </div>
                </div>

                {isRunning && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        Deliberating...
                    </div>
                )}
            </div>

            {/* Stream List */}
            <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                {thoughts.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                        <Bot className="mx-auto h-8 w-8 opacity-40 mb-2" />
                        <p>No decision cycle run yet. Click &quot;Run Agent Decision Cycle&quot; to initiate.</p>
                    </div>
                ) : (
                    thoughts.map((step) => {
                        const phaseColor =
                            step.phase === "Ingestion"
                                ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
                                : step.phase === "Analysis"
                                ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
                                : step.phase === "Valuation"
                                ? "text-purple-400 border-purple-500/20 bg-purple-500/5"
                                : step.phase === "Risk Sizing"
                                ? "text-blue-400 border-blue-500/20 bg-blue-500/5"
                                : "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";

                        return (
                            <div
                                key={`${step.step}-${step.timestamp}`}
                                className="flex items-start gap-3 rounded-lg border border-white/5 bg-[#181818] p-2.5 hover:bg-[#1e1e1e] transition-colors"
                            >
                                <span className="text-[10px] text-slate-500 font-medium shrink-0 pt-0.5">
                                    #{step.step}
                                </span>

                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider shrink-0 ${phaseColor}`}
                                >
                                    {step.phase}
                                </span>

                                <span className="text-slate-300 font-sans text-xs leading-relaxed flex-1">
                                    {step.message}
                                </span>

                                <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                                    <Clock className="h-2.5 w-2.5" />
                                    {step.timestamp}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
