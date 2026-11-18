"use client";

import { MARKET_NEWS } from "@/lib/constants";
import { Newspaper, Clock, ExternalLink, Flame } from "lucide-react";

export default function MarketNewsFeed() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 lg:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Market Intelligence & News
            </h2>
            <p className="text-xs text-slate-400">
              Curated financial headlines and sector breakdowns
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
          <Flame className="h-3.5 w-3.5" />
          Live Wire
        </span>
      </div>

      {/* Articles Grid / List */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MARKET_NEWS.map((article) => {
          return (
            <article
              key={article.id}
              className="group flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-amber-400/30 hover:bg-[#161616] transition-all"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/5 px-2 py-0.5 font-medium text-slate-300 border border-white/10">
                      {article.category}
                    </span>
                    <span className="font-medium text-amber-400/90">
                      {article.source}
                    </span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                      article.sentiment === "Bullish"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : article.sentiment === "Bearish"
                        ? "text-rose-400 bg-rose-500/10"
                        : "text-slate-400 bg-white/5"
                    }`}
                  >
                    {article.sentiment}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>

                {/* Summary */}
                <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {article.timeAgo} • {article.readTime}
                </span>
                <span className="flex items-center gap-1 text-slate-400 group-hover:text-amber-400 transition-colors font-medium">
                  Read more
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
