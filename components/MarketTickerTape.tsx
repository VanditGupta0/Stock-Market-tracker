"use client";

import { TICKER_ITEMS } from "@/lib/constants";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketTickerTape() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 bg-[#0d0d0d]/80 py-2.5 backdrop-blur-md">
      <div className="flex w-max items-center animate-ticker hover:[animation-play-state:paused]">
        {/* Double the list for smooth infinite looping animation */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const isUp = item.isPositive;
          return (
            <div
              key={`${item.symbol}-${idx}`}
              className="mx-4 flex items-center gap-2.5 rounded-md px-2.5 py-1 text-xs transition-colors hover:bg-white/5 cursor-default"
            >
              <span className="font-semibold text-slate-200">{item.symbol}</span>
              <span className="font-mono text-slate-300">{item.price}</span>
              <span
                className={`flex items-center gap-0.5 font-medium ${
                  isUp ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="h-3 w-3 inline" />
                ) : (
                  <TrendingDown className="h-3 w-3 inline" />
                )}
                <span>
                  {item.change} ({item.percentChange > 0 ? "+" : ""}
                  {item.percentChange}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
