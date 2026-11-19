"use client";

import { useState } from "react";
import { MarketIndex, HERO_CHART_SERIES, ChartDataPoint } from "@/lib/constants";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface MarketIndexHeroProps {
  currentIndex: MarketIndex;
}

export default function MarketIndexHero({ currentIndex }: MarketIndexHeroProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y">("1D");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  const series = HERO_CHART_SERIES[timeframe] || HERO_CHART_SERIES["1D"];

  const prices = series.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...series.map((d) => d.volume)) || 1;

  const width = 800;
  const height = 320;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 60;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  const coords = series.map((point, index) => {
    const x = paddingX + (index / (series.length - 1)) * chartWidth;
    const y =
      paddingTop +
      chartHeight -
      ((point.price - minPrice) / priceRange) * (chartHeight - 20);
    return { x, y, point };
  });

  const linePath = coords.reduce((acc, coord, i) => {
    if (i === 0) return `M ${coord.x},${coord.y}`;
    const prev = coords[i - 1];
    const cx = (prev.x + coord.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${coord.y} ${coord.x},${coord.y}`;
  }, "");

  const areaPath = `${linePath} L ${paddingX + chartWidth},${
    paddingTop + chartHeight
  } L ${paddingX},${paddingTop + chartHeight} Z`;

  const isUp = currentIndex.isPositive;
  const strokeColor = isUp ? "#10b981" : "#f43f5e";

  const displayPrice = hoveredPoint
    ? hoveredPoint.price.toLocaleString("en-IN")
    : currentIndex.price;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {currentIndex.symbol}
            </h2>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300 border border-white/10 font-medium">
              {currentIndex.name}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Market
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              ₹{displayPrice}
            </span>
            <span
              className={`flex items-center gap-1 text-sm font-semibold font-mono ${
                isUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {currentIndex.change} ({currentIndex.percentChange > 0 ? "+" : ""}
              {currentIndex.percentChange}%)
            </span>
            {hoveredPoint && (
              <span className="text-xs text-slate-400 font-mono">
                at {hoveredPoint.time}
              </span>
            )}
          </div>
        </div>

        {/* Timeframe & Action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
            {(["1D", "1W", "1M", "1Y"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeframe(tf);
                  setHoveredPoint(null);
                }}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? "bg-amber-400 text-black shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            title="Refresh snapshot"
            onClick={() => setHoveredPoint(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="relative mt-4 w-full h-[280px] sm:h-[320px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hero-chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="60%" stopColor={strokeColor} stopOpacity={0.08} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
            <pattern
              id="chart-grid"
              width="100"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Grid lines */}
          <rect
            x={paddingX}
            y={paddingTop}
            width={chartWidth}
            height={chartHeight}
            fill="url(#chart-grid)"
          />

          {/* Volume sub-bars in background */}
          {coords.map((c, i) => {
            const barHeight =
              (c.point.volume / maxVolume) * (chartHeight * 0.25);
            const barY = paddingTop + chartHeight - barHeight;
            return (
              <rect
                key={`vol-${i}`}
                x={c.x - 4}
                y={barY}
                width={8}
                height={barHeight}
                fill={isUp ? "#10b981" : "#f43f5e"}
                opacity={0.12}
                rx={1}
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#hero-chart-gradient)" />

          {/* Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover line & points */}
          {coords.map((coord, i) => {
            const isHovered =
              hoveredPoint?.time === coord.point.time ||
              (!hoveredPoint && i === coords.length - 1);

            return (
              <g key={`point-${i}`}>
                {/* Hit area */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={16}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(coord.point)}
                />

                {isHovered && (
                  <>
                    {/* Vertical guide line */}
                    <line
                      x1={coord.x}
                      y1={paddingTop}
                      x2={coord.x}
                      y2={paddingTop + chartHeight}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />

                    {/* Outer glow ring */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={7}
                      fill={strokeColor}
                      opacity={0.3}
                    />
                    {/* Center point */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={4}
                      fill="#ffffff"
                      stroke={strokeColor}
                      strokeWidth={2}
                    />
                  </>
                )}

                {/* X Axis Time Labels */}
                <text
                  x={coord.x}
                  y={height - 20}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {coord.point.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer key stats strip */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/5 pt-4 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400">Previous Close</span>
          <span className="font-semibold text-slate-200 font-mono">
            ₹{currentIndex.prevClose}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Day&apos;s Range</span>
          <span className="font-semibold text-slate-200 font-mono">
            ₹{currentIndex.dayLow} - ₹{currentIndex.dayHigh}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">52-Week Range</span>
          <span className="font-semibold text-slate-200 font-mono">
            ₹{currentIndex.week52Low} - ₹{currentIndex.week52High}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Total Index Volume</span>
          <span className="font-semibold text-slate-200 font-mono">
            {currentIndex.volume} shares
          </span>
        </div>
      </div>
    </div>
  );
}
