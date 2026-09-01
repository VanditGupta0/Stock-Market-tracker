"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function DashboardHeaderBanner() {
  const [time, setTime] = useState<string>("15:30:00 IST");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-white/5 bg-gradient-to-r from-[#141414] via-[#161616] to-[#121212] p-5 lg:p-6 shadow-xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Live Market Session
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-400">NSE / BSE India</span>
        </div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Market Intelligence Dashboard
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
          Real-time indices tracking, sector breadth analytics, market movers, and institutional flow indicators.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Market Breadth Pill */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Market Breadth</span>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-emerald-400">1,482 Adv</span>
              <span className="text-slate-400">/</span>
              <span className="text-rose-400">894 Dec</span>
            </div>
          </div>
        </div>

        {/* Live Clock Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-mono text-slate-300">
          <Clock className="h-4 w-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Session Time</span>
            <span className="font-semibold text-white">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
