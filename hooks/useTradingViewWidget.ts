"use client";

import { useEffect, useRef } from "react";

export default function useTradingViewWidget(
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetRoot = document.createElement("div");
    widgetRoot.className = "tradingview-widget-container__widget";
    widgetRoot.style.width = "100%";
    widgetRoot.style.height = `${height}px`;
    container.appendChild(widgetRoot);

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [scriptUrl, config, height]);

  return containerRef;
}
