"use client";

import { useState } from "react";
import { MARKET_INDICES } from "@/lib/constants";
import MarketTickerTape from "@/components/MarketTickerTape";
import DashboardHeaderBanner from "@/components/DashboardHeaderBanner";
import MarketSummaryCards from "@/components/MarketSummaryCards";
import MarketIndexHero from "@/components/MarketIndexHero";
import MarketMovers from "@/components/MarketMovers";
import SectorPerformance from "@/components/SectorPerformance";
import HeatmapGrid from "@/components/HeatmapGrid";
import MacroIndicators from "@/components/MacroIndicators";
import MarketNewsFeed from "@/components/MarketNewsFeed";

export default function Home() {
  const [selectedIndexId, setSelectedIndexId] = useState<string>("nifty50");

  const selectedIndex =
    MARKET_INDICES.find((idx) => idx.id === selectedIndexId) ||
    MARKET_INDICES[0];

  return (
    <div className="space-y-8">
      {/* Horizontal Market Ticker Tape */}
      <div className="-mx-4 -mt-8 sm:-mx-6 sm:-mt-8 lg:-mx-8 lg:-mt-10 mb-6">
        <MarketTickerTape />
      </div>

      {/* Dashboard Top Banner */}
      <DashboardHeaderBanner />

      {/* Benchmark Indices Cards */}
      <section aria-label="Key Market Indices">
        <MarketSummaryCards
          indices={MARKET_INDICES}
          selectedIndexId={selectedIndexId}
          onSelectIndex={setSelectedIndexId}
        />
      </section>

      {/* Interactive Main Index Chart Hero */}
      <section aria-label="Index Analysis Chart">
        <MarketIndexHero currentIndex={selectedIndex} />
      </section>

      {/* Market Movers & Sector Breakdown 2-Col Grid */}
      <section
        aria-label="Movers and Sector Performance"
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start"
      >
        <div className="lg:col-span-7">
          <MarketMovers />
        </div>
        <div className="lg:col-span-5">
          <SectorPerformance />
        </div>
      </section>

      {/* Interactive Market Heatmap */}
      <section aria-label="Stock Market Heatmap">
        <HeatmapGrid />
      </section>

      {/* Macro Indicators & Market Intelligence News */}
      <section
        aria-label="Macro Indicators and News Feed"
        className="space-y-8"
      >
        <MacroIndicators />
        <MarketNewsFeed />
      </section>
    </div>
  );
}
