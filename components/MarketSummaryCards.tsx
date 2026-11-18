"use client";

import { MarketIndex } from "@/lib/constants";
import Sparkline from "@/components/Sparkline";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketSummaryCardsProps {
  indices: MarketIndex[];
  selectedIndexId: string;
  onSelectIndex: (id: string) => void;
}

export default function MarketSummaryCards({
  indices,
  selectedIndexId,
  onSelectIndex,
}: MarketSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {indices.map((idx) => {
        const isSelected = idx.id === selectedIndexId;
        const isUp = idx.isPositive;

        // Parse numerical high/low to calculate range progress
        const lowNum = parseFloat(idx.dayLow.replace(/,/g, ""));
        const highNum = parseFloat(idx.dayHigh.replace(/,/g, ""));
        const currentNum = parseFloat(idx.price.replace(/,/g, ""));
        const rangePercent =
          highNum - lowNum > 0
            ? Math.min(
                100,
                Math.max(0, ((currentNum - lowNum) / (highNum - lowNum)) * 100)
              )
            : 50;

        return (
          <button
            key={idx.id}
            type="button"
            onClick={() => onSelectIndex(idx.id)}
            className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
              isSelected
                ? "border-amber-400/40 bg-gradient-to-b from-[#1c1a13] to-[#141414] shadow-lg shadow-amber-400/5 ring-1 ring-amber-400/30"
                : "border-white/5 bg-[#121212] hover:border-white/15 hover:bg-[#161616]"
            }`}
          >
            {/* Top Row: Symbol & Change Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-slate-100 group-hover:text-white">
                    {idx.symbol}
                  </h3>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[130px]">
                  {idx.name}
                </p>
              </div>

              <div
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                  isUp
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {idx.percentChange > 0 ? "+" : ""}
                  {idx.percentChange}%
                </span>
              </div>
            </div>

            {/* Price and Mini Sparkline */}
            <div className="my-3.5 flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold tracking-tight text-white font-mono">
                  {idx.price}
                </div>
                <div
                  className={`text-xs font-medium font-mono ${
                    isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {idx.change} pts today
                </div>
              </div>
              <div className="pr-1">
                <Sparkline
                  data={idx.sparkline}
                  isPositive={isUp}
                  width={90}
                  height={34}
                />
              </div>
            </div>

            {/* Day Range Slider */}
            <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>L: {idx.dayLow}</span>
                <span>H: {idx.dayHigh}</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUp ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                  style={{ width: `${rangePercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-slate-400" />
                  Vol: {idx.volume}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  52W H: {idx.week52High}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
