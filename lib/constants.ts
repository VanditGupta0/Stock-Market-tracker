export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/watchlist", label: "Watchlist" },
] as const;

export interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percentChange: number;
  isPositive: boolean;
}

export const TICKER_ITEMS: TickerItem[] = [
  { symbol: "NIFTY 50", name: "NSE Nifty 50", price: "24,835.10", change: "+142.30", percentChange: 0.58, isPositive: true },
  { symbol: "SENSEX", name: "BSE Sensex", price: "81,332.72", change: "+410.85", percentChange: 0.51, isPositive: true },
  { symbol: "BANK NIFTY", name: "Nifty Bank", price: "51,198.40", change: "-124.60", percentChange: -0.24, isPositive: false },
  { symbol: "NIFTY IT", name: "Nifty IT", price: "42,110.25", change: "+530.15", percentChange: 1.28, isPositive: true },
  { symbol: "INDIA VIX", name: "Volatility Index", price: "13.42", change: "-0.48", percentChange: -3.45, isPositive: true },
  { symbol: "USD/INR", name: "US Dollar / INR", price: "83.92", change: "+0.04", percentChange: 0.05, isPositive: false },
  { symbol: "BRENT CRUDE", name: "Crude Oil (USD)", price: "$79.20", change: "-1.12", percentChange: -1.40, isPositive: true },
  { symbol: "GOLD 24K", name: "Gold per 10g", price: "₹72,450", change: "+320.00", percentChange: 0.44, isPositive: true },
  { symbol: "RELIANCE", name: "Reliance Ind.", price: "₹2,980.50", change: "+38.40", percentChange: 1.31, isPositive: true },
  { symbol: "TCS", name: "Tata Consultancy", price: "₹4,420.00", change: "+54.30", percentChange: 1.24, isPositive: true },
];

export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  percentChange: number;
  isPositive: boolean;
  dayHigh: string;
  dayLow: string;
  prevClose: string;
  week52High: string;
  week52Low: string;
  volume: string;
  sparkline: number[];
}

export const MARKET_INDICES: MarketIndex[] = [
  {
    id: "nifty50",
    symbol: "NIFTY 50",
    name: "National Stock Exchange",
    price: "24,835.10",
    change: "+142.30",
    percentChange: 0.58,
    isPositive: true,
    dayHigh: "24,870.40",
    dayLow: "24,690.15",
    prevClose: "24,692.80",
    week52High: "25,078.30",
    week52Low: "18,837.85",
    volume: "382.4M",
    sparkline: [24692, 24710, 24705, 24740, 24730, 24780, 24765, 24810, 24795, 24840, 24835],
  },
  {
    id: "sensex",
    symbol: "SENSEX",
    name: "Bombay Stock Exchange",
    price: "81,332.72",
    change: "+410.85",
    percentChange: 0.51,
    isPositive: true,
    dayHigh: "81,450.10",
    dayLow: "80,910.30",
    prevClose: "80,921.87",
    week52High: "82,129.49",
    week52Low: "63,583.07",
    volume: "24.1M",
    sparkline: [80921, 80980, 81050, 81010, 81140, 81200, 81180, 81290, 81350, 81332],
  },
  {
    id: "banknifty",
    symbol: "BANK NIFTY",
    name: "Nifty Banking Sector",
    price: "51,198.40",
    change: "-124.60",
    percentChange: -0.24,
    isPositive: false,
    dayHigh: "51,450.00",
    dayLow: "51,020.10",
    prevClose: "51,323.00",
    week52High: "53,357.70",
    week52Low: "42,105.40",
    volume: "189.6M",
    sparkline: [51323, 51350, 51280, 51210, 51150, 51220, 51110, 51080, 51140, 51198],
  },
  {
    id: "niftyit",
    symbol: "NIFTY IT",
    name: "Technology Index",
    price: "42,110.25",
    change: "+530.15",
    percentChange: 1.28,
    isPositive: true,
    dayHigh: "42,190.50",
    dayLow: "41,580.00",
    prevClose: "41,580.10",
    week52High: "43,140.00",
    week52Low: "30,420.25",
    volume: "98.2M",
    sparkline: [41580, 41650, 41720, 41790, 41850, 41920, 42010, 42080, 42150, 42110],
  },
];

export interface StockMover {
  symbol: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  percentChange: number;
  volume: string;
  marketCap: string;
  peRatio: string;
  sparkline: number[];
}

export const TOP_GAINERS: StockMover[] = [
  {
    symbol: "TATASTEEL",
    name: "Tata Steel Ltd.",
    sector: "Metals",
    price: "₹164.80",
    change: "+7.45",
    percentChange: 4.73,
    volume: "42.8M",
    marketCap: "₹2.05T",
    peRatio: "28.4",
    sparkline: [157.35, 158.2, 160.1, 159.5, 161.8, 163.4, 164.8],
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    sector: "IT Services",
    price: "₹1,892.40",
    change: "+62.10",
    percentChange: 3.39,
    volume: "18.3M",
    marketCap: "₹7.86T",
    peRatio: "29.8",
    sparkline: [1830.3, 1845, 1860, 1855, 1875, 1888, 1892.4],
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy / Telecom",
    price: "₹2,980.50",
    change: "+72.30",
    percentChange: 2.49,
    volume: "14.1M",
    marketCap: "₹20.17T",
    peRatio: "27.2",
    sparkline: [2908.2, 2920, 2940, 2935, 2960, 2975, 2980.5],
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd.",
    sector: "Telecom",
    price: "₹1,560.15",
    change: "+34.60",
    percentChange: 2.27,
    volume: "9.5M",
    marketCap: "₹9.12T",
    peRatio: "45.1",
    sparkline: [1525.55, 1530, 1542, 1538, 1550, 1555, 1560.15],
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd.",
    sector: "Financial Services",
    price: "₹7,240.00",
    change: "+138.50",
    percentChange: 1.95,
    volume: "3.2M",
    marketCap: "₹4.48T",
    peRatio: "32.6",
    sparkline: [7101.5, 7120, 7160, 7180, 7210, 7225, 7240],
  },
];

export const TOP_LOSERS: StockMover[] = [
  {
    symbol: "INDUSINDBK",
    name: "IndusInd Bank Ltd.",
    sector: "Banking",
    price: "₹1,385.20",
    change: "-42.80",
    percentChange: -3.00,
    volume: "8.1M",
    marketCap: "₹1.08T",
    peRatio: "12.4",
    sparkline: [1428, 1420, 1410, 1405, 1395, 1388, 1385.2],
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    sector: "Banking",
    price: "₹1,624.50",
    change: "-28.30",
    percentChange: -1.71,
    volume: "24.5M",
    marketCap: "₹12.35T",
    peRatio: "18.9",
    sparkline: [1652.8, 1648, 1640, 1635, 1630, 1622, 1624.5],
  },
  {
    symbol: "ITC",
    name: "ITC Limited",
    sector: "FMCG",
    price: "₹492.30",
    change: "-7.80",
    percentChange: -1.56,
    volume: "16.8M",
    marketCap: "₹6.15T",
    peRatio: "29.1",
    sparkline: [500.1, 498, 496.5, 495, 494, 491, 492.3],
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India",
    sector: "Automobile",
    price: "₹12,180.00",
    change: "-160.00",
    percentChange: -1.30,
    volume: "1.4M",
    marketCap: "₹3.82T",
    peRatio: "28.5",
    sparkline: [12340, 12300, 12280, 12240, 12200, 12160, 12180],
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharma Ind.",
    sector: "Healthcare",
    price: "₹1,740.10",
    change: "-18.90",
    percentChange: -1.07,
    volume: "4.7M",
    marketCap: "₹4.17T",
    peRatio: "38.2",
    sparkline: [1759, 1754, 1750, 1745, 1742, 1738, 1740.1],
  },
];

export const MOST_ACTIVE: StockMover[] = [
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    sector: "Banking",
    price: "₹1,624.50",
    change: "-28.30",
    percentChange: -1.71,
    volume: "42.5M",
    marketCap: "₹12.35T",
    peRatio: "18.9",
    sparkline: [1652.8, 1648, 1640, 1635, 1630, 1622, 1624.5],
  },
  {
    symbol: "TATASTEEL",
    name: "Tata Steel Ltd.",
    sector: "Metals",
    price: "₹164.80",
    change: "+7.45",
    percentChange: 4.73,
    volume: "42.8M",
    marketCap: "₹2.05T",
    peRatio: "28.4",
    sparkline: [157.35, 158.2, 160.1, 159.5, 161.8, 163.4, 164.8],
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy / Telecom",
    price: "₹2,980.50",
    change: "+72.30",
    percentChange: 2.49,
    volume: "31.2M",
    marketCap: "₹20.17T",
    peRatio: "27.2",
    sparkline: [2908.2, 2920, 2940, 2935, 2960, 2975, 2980.5],
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    sector: "Public Banking",
    price: "₹812.60",
    change: "+4.10",
    percentChange: 0.51,
    volume: "28.4M",
    marketCap: "₹7.25T",
    peRatio: "10.8",
    sparkline: [808.5, 810, 814, 811, 813, 815, 812.6],
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    sector: "IT Services",
    price: "₹1,892.40",
    change: "+62.10",
    percentChange: 3.39,
    volume: "18.3M",
    marketCap: "₹7.86T",
    peRatio: "29.8",
    sparkline: [1830.3, 1845, 1860, 1855, 1875, 1888, 1892.4],
  },
];

export interface SectorMetric {
  name: string;
  code: string;
  changePercent: number;
  advances: number;
  declines: number;
  topPerformer: string;
  marketWeight: string;
}

export const SECTOR_PERFORMANCE: SectorMetric[] = [
  { name: "Nifty IT", code: "IT", changePercent: 1.84, advances: 9, declines: 1, topPerformer: "INFY (+3.39%)", marketWeight: "14.2%" },
  { name: "Nifty Metal", code: "METAL", changePercent: 1.52, advances: 12, declines: 3, topPerformer: "TATASTEEL (+4.73%)", marketWeight: "4.1%" },
  { name: "Nifty Auto", code: "AUTO", changePercent: 0.88, advances: 11, declines: 4, topPerformer: "TATAMOTORS (+2.1%)", marketWeight: "6.8%" },
  { name: "Nifty Energy", code: "ENERGY", changePercent: 0.65, advances: 8, declines: 2, topPerformer: "RELIANCE (+2.49%)", marketWeight: "12.5%" },
  { name: "Nifty Pharma", code: "PHARMA", changePercent: 0.22, advances: 10, declines: 10, topPerformer: "CIPLA (+1.4%)", marketWeight: "4.8%" },
  { name: "Nifty FMCG", code: "FMCG", changePercent: -0.45, advances: 4, declines: 11, topPerformer: "NESTLEIND (+0.3%)", marketWeight: "8.9%" },
  { name: "Nifty Realty", code: "REALTY", changePercent: -0.82, advances: 3, declines: 7, topPerformer: "DLF (+0.8%)", marketWeight: "1.9%" },
  { name: "Nifty Bank", code: "BANK", changePercent: -0.24, advances: 5, declines: 7, topPerformer: "SBIN (+0.51%)", marketWeight: "31.4%" },
];

export interface MacroIndicator {
  name: string;
  value: string;
  unit: string;
  change: string;
  isPositive: boolean;
  status: "Bullish" | "Neutral" | "Bearish";
  description: string;
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    name: "India VIX",
    value: "13.42",
    unit: "pts",
    change: "-3.45%",
    isPositive: true,
    status: "Bullish",
    description: "Market volatility remains well below caution thresholds.",
  },
  {
    name: "USD / INR",
    value: "83.92",
    unit: "₹",
    change: "+0.05%",
    isPositive: false,
    status: "Neutral",
    description: "Rupee trades within stable RBI intervention band.",
  },
  {
    name: "Brent Crude",
    value: "$79.20",
    unit: "bbl",
    change: "-1.40%",
    isPositive: true,
    status: "Bullish",
    description: "Cooling oil prices reduce imported inflation pressure.",
  },
  {
    name: "10Y Benchmark Yield",
    value: "6.86%",
    unit: "yield",
    change: "-2 bps",
    isPositive: true,
    status: "Bullish",
    description: "G-Sec yields soften amid strong foreign institutional inflows.",
  },
  {
    name: "FII Net Inflow (Today)",
    value: "+₹1,842",
    unit: "Cr",
    change: "Net Buyer",
    isPositive: true,
    status: "Bullish",
    description: "Foreign funds maintain buying momentum across bluechips.",
  },
  {
    name: "DII Net Inflow (Today)",
    value: "+₹950",
    unit: "Cr",
    change: "Net Buyer",
    isPositive: true,
    status: "Bullish",
    description: "Domestic mutual funds provide consistent liquidity support.",
  },
];

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  category: "Markets" | "Earnings" | "Macro" | "Sector" | "Global";
  sentiment: "Bullish" | "Bearish" | "Neutral";
  readTime: string;
}

export const MARKET_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "Nifty 50 approaches all-time resistance as IT & Metals lead broad-based rally",
    summary: "Benchmark indices closed with solid gains led by heavyweight IT exporters and surging metal counters amid favorable global cues and softening yields.",
    source: "Bloomberg Quint",
    timeAgo: "25m ago",
    category: "Markets",
    sentiment: "Bullish",
    readTime: "3 min read",
  },
  {
    id: "news-2",
    title: "Tata Steel reports sharp sequential margin expansion on strong domestic demand",
    summary: "Infrastructure push and buoyant construction volumes buoyed realisations across long products, with management reiterating capacity expansion plans.",
    source: "Economic Times",
    timeAgo: "1h ago",
    category: "Earnings",
    sentiment: "Bullish",
    readTime: "4 min read",
  },
  {
    id: "news-3",
    title: "RBI MPC signals steady stance as headline retail inflation cools towards 4% target",
    summary: "Monetary policy committee members noted stable agricultural output and moderating core price pressures while retaining growth forecasts at 7.2%.",
    source: "Financial Express",
    timeAgo: "2h ago",
    category: "Macro",
    sentiment: "Neutral",
    readTime: "5 min read",
  },
  {
    id: "news-4",
    title: "Infosys and TCS secure multi-million dollar enterprise AI transformation deals",
    summary: "Cloud migration and generative AI integration deals in North America and Western Europe fuel sequential revenue visibility for tier-1 tech firms.",
    source: "Mint",
    timeAgo: "3h ago",
    category: "Sector",
    sentiment: "Bullish",
    readTime: "2 min read",
  },
  {
    id: "news-5",
    title: "Crude oil retreats below $80/barrel as inventory builds offset Middle East supply concerns",
    summary: "Cooling energy prices provide a substantial macroeconomic cushion for import-heavy emerging economies, boosting airline and paint manufacturer margins.",
    source: "Reuters",
    timeAgo: "4h ago",
    category: "Global",
    sentiment: "Bullish",
    readTime: "4 min read",
  },
];

export interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

export const HERO_CHART_SERIES: Record<string, ChartDataPoint[]> = {
  "1D": [
    { time: "09:15", price: 24692, volume: 12000 },
    { time: "10:00", price: 24715, volume: 24000 },
    { time: "10:45", price: 24705, volume: 18000 },
    { time: "11:30", price: 24748, volume: 32000 },
    { time: "12:15", price: 24730, volume: 15000 },
    { time: "13:00", price: 24785, volume: 28000 },
    { time: "13:45", price: 24760, volume: 21000 },
    { time: "14:30", price: 24815, volume: 45000 },
    { time: "15:00", price: 24840, volume: 56000 },
    { time: "15:30", price: 24835, volume: 62000 },
  ],
  "1W": [
    { time: "Mon", price: 24520, volume: 150000 },
    { time: "Tue", price: 24610, volume: 180000 },
    { time: "Wed", price: 24590, volume: 140000 },
    { time: "Thu", price: 24720, volume: 210000 },
    { time: "Fri", price: 24835, volume: 260000 },
  ],
  "1M": [
    { time: "W1", price: 24100, volume: 800000 },
    { time: "W2", price: 24280, volume: 920000 },
    { time: "W3", price: 24500, volume: 890000 },
    { time: "W4", price: 24835, volume: 1100000 },
  ],
  "1Y": [
    { time: "Sep", price: 19800, volume: 3200000 },
    { time: "Nov", price: 20200, volume: 3500000 },
    { time: "Jan", price: 21700, volume: 4100000 },
    { time: "Mar", price: 22400, volume: 4300000 },
    { time: "May", price: 22900, volume: 3900000 },
    { time: "Jul", price: 24400, volume: 4700000 },
    { time: "Aug", price: 24835, volume: 4900000 },
  ],
};

export interface HeatmapItem {
  ticker: string;
  name: string;
  sector: string;
  changePercent: number;
  weight: number;
  price: string;
}

export const HEATMAP_BLOCKS: HeatmapItem[] = [
  { ticker: "RELIANCE", name: "Reliance Ind.", sector: "Energy", changePercent: 2.49, weight: 4, price: "₹2,980.50" },
  { ticker: "TCS", name: "Tata Consultancy", sector: "IT", changePercent: 1.24, weight: 3, price: "₹4,420.00" },
  { ticker: "HDFCBANK", name: "HDFC Bank", sector: "Banking", changePercent: -1.71, weight: 4, price: "₹1,624.50" },
  { ticker: "INFY", name: "Infosys", sector: "IT", changePercent: 3.39, weight: 3, price: "₹1,892.40" },
  { ticker: "ICICIBANK", name: "ICICI Bank", sector: "Banking", changePercent: 0.65, weight: 3, price: "₹1,180.20" },
  { ticker: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", changePercent: 2.27, weight: 3, price: "₹1,560.15" },
  { ticker: "SBIN", name: "State Bank of India", sector: "Banking", changePercent: 0.51, weight: 2, price: "₹812.60" },
  { ticker: "ITC", name: "ITC Ltd.", sector: "FMCG", changePercent: -1.56, weight: 2, price: "₹492.30" },
  { ticker: "LT", name: "Larsen & Toubro", sector: "Infrastructure", changePercent: 1.10, weight: 2, price: "₹3,640.00" },
  { ticker: "TATASTEEL", name: "Tata Steel", sector: "Metals", changePercent: 4.73, weight: 2, price: "₹164.80" },
  { ticker: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", changePercent: -0.35, weight: 2, price: "₹2,710.00" },
  { ticker: "SUNPHARMA", name: "Sun Pharma", sector: "Healthcare", changePercent: -1.07, weight: 2, price: "₹1,740.10" },
  { ticker: "BAJFINANCE", name: "Bajaj Finance", sector: "Finance", changePercent: 1.95, weight: 2, price: "₹7,240.00" },
  { ticker: "MARUTI", name: "Maruti Suzuki", sector: "Auto", changePercent: -1.30, weight: 2, price: "₹12,180.00" },
  { ticker: "WIPRO", name: "Wipro", sector: "IT", changePercent: 1.85, weight: 1, price: "₹525.40" },
  { ticker: "AXISBANK", name: "Axis Bank", sector: "Banking", changePercent: -0.42, weight: 2, price: "₹1,175.00" },
  { ticker: "KOTAKBANK", name: "Kotak Mahindra", sector: "Banking", changePercent: -0.15, weight: 2, price: "₹1,795.00" },
  { ticker: "NTPC", name: "NTPC Ltd.", sector: "Power", changePercent: 1.45, weight: 1, price: "₹395.10" },
  { ticker: "TATAMOTORS", name: "Tata Motors", sector: "Auto", changePercent: 2.10, weight: 2, price: "₹1,085.00" },
  { ticker: "POWERGRID", name: "Power Grid Corp", sector: "Power", changePercent: 0.75, weight: 1, price: "₹330.20" },
];

// Legacy / widget configs for compatibility
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
