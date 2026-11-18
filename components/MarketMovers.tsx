"use client";

import { useState } from "react";
import { TOP_GAINERS, TOP_LOSERS, MOST_ACTIVE, StockMover } from "@/lib/constants";
import Sparkline from "@/components/Sparkline";
import { TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";

export default function MarketMovers() {
  const [tab, setTab] = useState<"gainers" | "losers" | "active">("gainers");
  const [searchQuery, setSearchQuery] = useState("");

  const dataMap: Record<"gainers" | "losers" | "active", StockMover[]> = {
    gainers: TOP_GAINERS,
    losers: TOP_LOSERS,
    active: MOST_ACTIVE,
  };

  const currentList = dataMap[tab].filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 lg:p-6 shadow-xl">
      {/* Header with Tabs and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Market Movers
            </h2>
            <p className="text-xs text-slate-400">
              Top performing and active stocks today
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setTab("gainers")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                tab === "gainers"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Gainers
            </button>
            <button
              type="button"
              onClick={() => setTab("losers")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                tab === "losers"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              Losers
            </button>
            <button
              type="button"
              onClick={() => setTab("active")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                tab === "active"
                  ? "bg-amber-400 text-black shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Most Active
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-36 sm:w-44 rounded-lg border border-white/10 bg-black/30 pl-8 pr-3 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table / List View */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-2">Asset</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-right">24h Change</th>
              <th className="pb-3 text-center hidden md:table-cell">Trend (7D)</th>
              <th className="pb-3 text-right hidden sm:table-cell">Volume</th>
              <th className="pb-3 text-right hidden lg:table-cell">Market Cap</th>
              <th className="pb-3 text-right pr-2 hidden lg:table-cell">P/E</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {currentList.map((stock) => {
              const isUp = stock.percentChange > 0;
              return (
                <tr
                  key={stock.symbol}
                  className="group transition-colors hover:bg-white/[0.03]"
                >
                  {/* Asset info */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 font-bold font-mono text-slate-200 text-[11px] group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-colors">
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                          {stock.symbol}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="truncate max-w-[120px]">{stock.name}</span>
                          <span>•</span>
                          <span className="text-slate-400">{stock.sector}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 text-right font-mono font-semibold text-white">
                    {stock.price}
                  </td>

                  {/* 24h Change */}
                  <td className="py-3.5 text-right">
                    <div className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold font-mono"
                      style={{
                        backgroundColor: isUp ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                        color: isUp ? "#34d399" : "#fb7185",
                        border: isUp ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(244, 63, 94, 0.2)",
                      }}
                    >
                      {isUp ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {isUp ? "+" : ""}
                        {stock.percentChange}%
                      </span>
                    </div>
                  </td>

                  {/* 7D Trend Sparkline */}
                  <td className="py-3.5 text-center hidden md:table-cell">
                    <div className="flex justify-center">
                      <Sparkline
                        data={stock.sparkline}
                        isPositive={isUp}
                        width={85}
                        height={26}
                        showGradient={false}
                      />
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="py-3.5 text-right font-mono text-slate-300 hidden sm:table-cell">
                    {stock.volume}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3.5 text-right font-mono text-slate-300 hidden lg:table-cell">
                    {stock.marketCap}
                  </td>

                  {/* P/E Ratio */}
                  <td className="py-3.5 text-right font-mono text-slate-400 pr-2 hidden lg:table-cell">
                    {stock.peRatio}
                  </td>
                </tr>
              );
            })}

            {currentList.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No stocks match &quot;{searchQuery}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
