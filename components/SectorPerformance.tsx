"use client";

import { SECTOR_PERFORMANCE } from "@/lib/constants";
import { PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function SectorPerformance() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 lg:p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sector Performance
            </h2>
            <p className="text-xs text-slate-400">
              Daily returns across key economic sectors
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          8 Sectors
        </span>
      </div>

      {/* Sector list */}
      <div className="mt-4 space-y-3.5">
        {SECTOR_PERFORMANCE.map((sector) => {
          const isUp = sector.changePercent >= 0;
          const absVal = Math.min(100, Math.abs(sector.changePercent) * 25);

          return (
            <div key={sector.code} className="group flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                    {sector.name}
                  </span>
                  <span className="rounded bg-white/5 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono">
                    Weight: {sector.marketWeight}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-[11px] text-slate-400">
                    Lead: <span className="text-slate-300 font-medium">{sector.topPerformer}</span>
                  </span>
                  <span
                    className={`flex items-center gap-0.5 font-mono font-semibold ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {isUp ? "+" : ""}
                    {sector.changePercent}%
                  </span>
                </div>
              </div>

              {/* Progress bar representing change magnitude & advance/decline distribution */}
              <div className="flex items-center gap-2">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUp
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                        : "bg-gradient-to-r from-rose-600 to-rose-400"
                    }`}
                    style={{ width: `${Math.max(8, absVal)}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                  <span className="text-emerald-400/90">{sector.advances}↑</span>
                  <span>/</span>
                  <span className="text-rose-400/90">{sector.declines}↓</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance/Decline Summary Footer */}
      <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/5 p-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">Sector Breadth</span>
        <div className="flex items-center gap-4 font-mono font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            5 Advances
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            3 Declines
          </span>
        </div>
      </div>
    </div>
  );
}
