export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/watchlist", label: "Watchlist" },
] as const;

export const MARKET_OVERVIEW_WIDGET_CONFIG = {
  colorTheme: "dark",
  dateRange: "12M",
  locale: "in",
  isTransparent: true,
  showFloatingTooltip: true,
  width: "100%",
  height: 600,
  tabs: [
    { title: "Indices", symbols: [["BSE:SENSEX", "Sensex"], ["NSE:NIFTY", "Nifty 50"], ["NSE:BANKNIFTY", "Bank Nifty"]] },
    { title: "Stocks", symbols: [["NSE:RELIANCE", "Reliance"], ["NSE:TCS", "TCS"], ["NSE:INFY", "Infosys"], ["NSE:HDFCBANK", "HDFC Bank"], ["NSE:ITC", "ITC"]] },
  ],
} as Record<string, unknown>;

export const HEATMAP_WIDGET_CONFIG = {
  dataSource: "SENSEX",
  blockSize: "market_cap_basic",
  blockColor: "change",
  grouping: "sector",
  locale: "in",
  symbolUrl: "",
  colorTheme: "dark",
  exchanges: [],
  hasTopBar: true,
  isDataSetEnabled: true,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  isTransparent: true,
  width: "100%",
  height: 600,
} as Record<string, unknown>;

export const TOP_STORIES_WIDGET_CONFIG = {
  feedMode: "market",
  market: "stock",
  isTransparent: true,
  displayMode: "regular",
  width: "100%",
  height: 600,
  colorTheme: "dark",
  locale: "in",
} as Record<string, unknown>;

export const MARKET_DATA_WIDGET_CONFIG = {
  colorTheme: "dark",
  isTransparent: true,
  locale: "in",
  width: "100%",
  height: 600,
  largeChartUrl: "",
  showSymbolLogo: true,
  showFloatingTooltip: true,
  tabs: [
    {
      title: "Most Traded",
      symbols: [
        ["NSE:RELIANCE", "Reliance"],
        ["NSE:TCS", "TCS"],
        ["NSE:HDFCBANK", "HDFC Bank"],
        ["NSE:INFY", "Infosys"],
        ["NSE:ITC", "ITC"],
      ],
    },
    {
      title: "Large Cap",
      symbols: [
        ["NSE:BHARTIARTL", "Bharti Airtel"],
        ["NSE:SBIN", "SBI"],
        ["NSE:LT", "L&T"],
        ["NSE:ICICIBANK", "ICICI Bank"],
        ["NSE:KOTAKBANK", "Kotak Bank"],
      ],
    },
  ],
} as Record<string, unknown>;
