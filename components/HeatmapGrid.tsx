"use client";

import { useState } from "react";
import { HEATMAP_BLOCKS, HeatmapItem } from "@/lib/constants";
import { LayoutGrid, Info } from "lucide-react";

export default function HeatmapGrid() {
  const [activeItem, setActiveItem] = useState<HeatmapItem | null>(null);

  const getColorClass = (change: number) => {
    if (change >= 3) return "bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-400/40";
    if (change >= 1.5) return "bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border-emerald-500/30";
    if (change > 0) return "bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border-emerald-600/20";
    if (change === 0) return "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600/20";
    if (change > -1.5) return "bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border-rose-600/20";
    if (change > -3) return "bg-rose-800/60 hover:bg-rose-700 text-rose-100 border-rose-500/30";
    return "bg-rose-600/80 hover:bg-rose-500 text-white border-rose-400/40";
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 lg:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Market Heatmap
            </h2>
            <p className="text-xs text-slate-400">
              S&P BSE Sensex & Nifty 50 constituent distribution
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>-3%</span>
          <div className="flex h-2.5 w-24 overflow-hidden rounded">
            <div className="h-full w-1/4 bg-rose-600" />
            <div className="h-full w-1/4 bg-rose-900" />
            <div className="h-full w-1/4 bg-emerald-900" />
            <div className="h-full w-1/4 bg-emerald-500" />
          </div>
          <span>+5%</span>
        </div>
      </div>

      {/* Active hover inspector banner */}
      <div className="mt-3 min-h-[32px] flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300 border border-white/5">
        {activeItem ? (
          <>
            <span className="font-semibold text-white">
              {activeItem.ticker} ({activeItem.name})
            </span>
            <span className="text-slate-400">Sector: {activeItem.sector}</span>
            <span className="font-mono text-white">Price: {activeItem.price}</span>
            <span
              className={`font-mono font-semibold ${
                activeItem.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {activeItem.changePercent >= 0 ? "+" : ""}
              {activeItem.changePercent}%
            </span>
          </>
        ) : (
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Info className="h-3.5 w-3.5" />
            Hover over any tile to inspect asset metrics
          </span>
        )}
      </div>

      {/* Grid of tiles */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {HEATMAP_BLOCKS.map((item) => {
          const colorClass = getColorClass(item.changePercent);
          return (
            <div
              key={item.ticker}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
              className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${colorClass} ${
                item.weight >= 4 ? "col-span-2 row-span-2 min-h-[120px]" : "min-h-[75px]"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-xs tracking-tight">
                  {item.ticker}
                </span>
                <span className="text-[10px] opacity-75 font-mono">
                  {item.sector}
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[11px] font-mono opacity-90">
                  {item.price}
                </span>
                <span className="font-mono font-bold text-xs">
                  {item.changePercent >= 0 ? "+" : ""}
                  {item.changePercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
