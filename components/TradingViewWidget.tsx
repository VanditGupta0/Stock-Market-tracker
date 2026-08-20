"use client";

import { memo } from "react";
import useTradingViewWidget from "@/hooks/useTradingViewWidget";

type TradingViewWidgetProps = {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
};

function TradingViewWidget({ title, scriptUrl, config, height = 600 }: TradingViewWidgetProps) {
  const ref = useTradingViewWidget(scriptUrl, config, height);

  return (
    <section className="w-full">
      {title ? <h2 className="mb-4 text-xl font-semibold text-slate-100">{title}</h2> : null}
      <div ref={ref} className="tradingview-widget-container" />
    </section>
  );
}

export default memo(TradingViewWidget);
