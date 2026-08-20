export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/watchlist", label: "Watchlist" },
] as const;

export const MARKET_OVERVIEW_WIDGET_CONFIG = {
  colorTheme: "dark",
  dateRange: "12M",
  locale: "en",
  isTransparent: true,
  showFloatingTooltip: true,
  width: "100%",
  height: 600,
  tabs: [
    { title: "Indices", symbols: [["NASDAQ:NDX", "Nasdaq 100"], ["SP:SPX", "S&P 500"], ["TVC:DJI", "Dow Jones"]] },
    { title: "Stocks", symbols: [["NASDAQ:AAPL", "Apple"], ["NASDAQ:MSFT", "Microsoft"], ["NASDAQ:NVDA", "NVIDIA"]] },
  ],
} as Record<string, unknown>;

export const HEATMAP_WIDGET_CONFIG = {
  dataSource: "SPX500",
  blockSize: "market_cap_basic",
  blockColor: "change",
  grouping: "sector",
  locale: "en",
  symbolUrl: "",
  colorTheme: "dark",
  exchanges: [],
  hasTopBar: true,
  isDataSetEnabled: false,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  isTransparent: true,
  width: "100%",
  height: 600,
} as Record<string, unknown>;

export const TOP_STORIES_WIDGET_CONFIG = {
  feedMode: "market",
  isTransparent: true,
  displayMode: "regular",
  width: "100%",
  height: 600,
  colorTheme: "dark",
  locale: "en",
} as Record<string, unknown>;

export const MARKET_DATA_WIDGET_CONFIG = {
  colorTheme: "dark",
  isTransparent: true,
  locale: "en",
  width: "100%",
  height: 600,
  largeChartUrl: "",
  showSymbolLogo: true,
  showFloatingTooltip: true,
  tabs: [
    {
      title: "Most Traded",
      symbols: [
        ["NASDAQ:AAPL", "Apple"],
        ["NASDAQ:MSFT", "Microsoft"],
        ["NASDAQ:AMZN", "Amazon"],
        ["NASDAQ:NVDA", "NVIDIA"],
        ["NASDAQ:GOOGL", "Alphabet"],
      ],
    },
  ],
} as Record<string, unknown>;
