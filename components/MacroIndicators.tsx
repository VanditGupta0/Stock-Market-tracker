"use client";

import { MACRO_INDICATORS } from "@/lib/constants";
import { Globe2, ShieldCheck } from "lucide-react";

export default function MacroIndicators() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 lg:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Macro & Liquidity Indicators
            </h2>
            <p className="text-xs text-slate-400">
              Institutional flows, interest rates & volatility signals
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">
          <ShieldCheck className="h-3 w-3" />
          Low Risk Regime
        </span>
      </div>

      {/* Grid of indicators */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {MACRO_INDICATORS.map((macro) => {
          const isBull = macro.status === "Bullish";
          return (
            <div
              key={macro.name}
              className="flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/15 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-300">
                    {macro.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-white">
                      {macro.value}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {macro.unit}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-mono ${
                    isBull
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : macro.status === "Neutral"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {macro.change}
                </span>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-2">
                {macro.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
