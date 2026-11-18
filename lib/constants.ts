export const NAV_ITEMS = [
    { href: '/', label: 'Dashboard' },
    { href: '/search', label: 'Search' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/paper-trader', label: 'AI Trader' },
];

// Sign-up form select options
export const INVESTMENT_GOALS = [
    { value: 'Growth', label: 'Growth' },
    { value: 'Income', label: 'Income' },
    { value: 'Balanced', label: 'Balanced' },
    { value: 'Conservative', label: 'Conservative' },
];

export const RISK_TOLERANCE_OPTIONS = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
];

export const PREFERRED_INDUSTRIES = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Consumer Goods', label: 'Consumer Goods' },
];

export const ALERT_TYPE_OPTIONS = [
    { value: 'upper', label: 'Upper' },
    { value: 'lower', label: 'Lower' },
];

export const CONDITION_OPTIONS = [
    { value: 'greater', label: 'Greater than (>)' },
    { value: 'less', label: 'Less than (<)' },
];

// TradingView Charts
export const MARKET_OVERVIEW_WIDGET_CONFIG = {
    colorTheme: 'dark',
    dateRange: '12M',
    locale: 'en',
    largeChartUrl: '',
    isTransparent: true,
    showFloatingTooltip: true,
    plotLineColorGrowing: '#0FEDBE',
    plotLineColorFalling: '#0FEDBE',
    gridLineColor: 'rgba(240, 243, 250, 0)',
    scaleFontColor: '#DBDBDB',
    belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
    belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
    belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
    belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
    symbolActiveColor: 'rgba(15, 237, 190, 0.05)',

    tabs: [
        {
            title: 'Financial',
            symbols: [
                { s: 'BSE:SBIN', d: 'State Bank of India' },
                { s: 'BSE:HDFCBANK', d: 'HDFC Bank' },
                { s: 'BSE:ICICIBANK', d: 'ICICI Bank' },
                { s: 'BSE:AXISBANK', d: 'Axis Bank' },
                { s: 'BSE:KOTAKBANK', d: 'Kotak Mahindra Bank' },
                { s: 'BSE:BAJFINANCE', d: 'Bajaj Finance' },
            ],
        },
        {
            title: 'Technology',
            symbols: [
                { s: 'BSE:TCS', d: 'Tata Consultancy Services' },
                { s: 'BSE:INFY', d: 'Infosys' },
                { s: 'BSE:HCLTECH', d: 'HCL Technologies' },
                { s: 'BSE:WIPRO', d: 'Wipro' },
                { s: 'BSE:TECHM', d: 'Tech Mahindra' },
                { s: 'BSE:LTIM', d: 'LTIMindtree' },
            ],
        },
        {
            title: 'Services',
            symbols: [
                { s: 'BSE:RELIANCE', d: 'Reliance Industries' },
                { s: 'BSE:BHARTIARTL', d: 'Bharti Airtel' },
                { s: 'BSE:ITC', d: 'ITC' },
                { s: 'BSE:HINDUNILVR', d: 'Hindustan Unilever' },
                { s: 'BSE:MARUTI', d: 'Maruti Suzuki' },
            ],
        },
    ],

    support_host: 'https://www.tradingview.com',
    backgroundColor: '#141414',
    width: '100%',
    height: 600,
    showSymbolLogo: true,
    showChart: true,
};

export const HEATMAP_WIDGET_CONFIG = {
    // Indian market dataset
    dataSource: 'SENSEX',
    blockSize: 'market_cap_basic',
    blockColor: 'change',
    grouping: 'sector',
    isTransparent: true,
    locale: 'en',
    symbolUrl: '',
    colorTheme: 'dark',
    exchanges: ['BSE'],
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
    width: '100%',
    height: '600',
};

export const TOP_STORIES_WIDGET_CONFIG = {
    displayMode: 'regular',
    feedMode: 'market',
    colorTheme: 'dark',
    isTransparent: true,
    locale: 'en',
    market: 'stock',
    width: '100%',
    height: '600',
};

export const MARKET_DATA_WIDGET_CONFIG = {
    title: 'Indian Stocks',
    width: '100%',
    height: 600,
    locale: 'en',
    showSymbolLogo: true,
    colorTheme: 'dark',
    isTransparent: false,
    backgroundColor: '#0F0F0F',

    symbolsGroups: [
        {
            name: 'Financial',
            symbols: [
                { name: 'BSE:SBIN', displayName: 'State Bank of India' },
                { name: 'BSE:HDFCBANK', displayName: 'HDFC Bank' },
                { name: 'BSE:ICICIBANK', displayName: 'ICICI Bank' },
                { name: 'BSE:AXISBANK', displayName: 'Axis Bank' },
                { name: 'BSE:KOTAKBANK', displayName: 'Kotak Mahindra Bank' },
                { name: 'BSE:BAJFINANCE', displayName: 'Bajaj Finance' },
            ],
        },
        {
            name: 'Technology',
            symbols: [
                { name: 'BSE:TCS', displayName: 'Tata Consultancy Services' },
                { name: 'BSE:INFY', displayName: 'Infosys' },
                { name: 'BSE:HCLTECH', displayName: 'HCL Technologies' },
                { name: 'BSE:WIPRO', displayName: 'Wipro' },
                { name: 'BSE:TECHM', displayName: 'Tech Mahindra' },
                { name: 'BSE:LTIM', displayName: 'LTIMindtree' },
            ],
        },
        {
            name: 'Services',
            symbols: [
                { name: 'BSE:RELIANCE', displayName: 'Reliance Industries' },
                { name: 'BSE:BHARTIARTL', displayName: 'Bharti Airtel' },
                { name: 'BSE:ITC', displayName: 'ITC' },
                { name: 'BSE:HINDUNILVR', displayName: 'Hindustan Unilever' },
                { name: 'BSE:MARUTI', displayName: 'Maruti Suzuki' },
            ],
        },
    ],
};

const getTradingViewSymbol = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();

    if (upperSymbol.endsWith('.NS')) {
        return `BSE:${upperSymbol.replace('.NS', '')}`;
    }

    if (upperSymbol.endsWith('.BO')) {
        return `BSE:${upperSymbol.replace('.BO', '')}`;
    }

    return upperSymbol;
};

export const SYMBOL_INFO_WIDGET_CONFIG = (symbol: string) => ({
    symbol: getTradingViewSymbol(symbol),
    colorTheme: 'dark',
    isTransparent: true,
    locale: 'en',
    width: '100%',
    height: 170,
});

export const CANDLE_CHART_WIDGET_CONFIG = (symbol: string) => ({
    allow_symbol_change: false,
    calendar: false,
    details: true,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'en',
    save_image: false,
    style: 1,
    symbol: getTradingViewSymbol(symbol),
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: '#141414',
    gridColor: '#141414',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    width: '100%',
    height: 600,
});

export const BASELINE_WIDGET_CONFIG = (symbol: string) => ({
    allow_symbol_change: false,
    calendar: false,
    details: false,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'en',
    save_image: false,
    style: 10,
    symbol: getTradingViewSymbol(symbol),
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: '#141414',
    gridColor: '#141414',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    width: '100%',
    height: 600,
});

export const TECHNICAL_ANALYSIS_WIDGET_CONFIG = (symbol: string) => ({
    symbol: getTradingViewSymbol(symbol),
    colorTheme: 'dark',
    isTransparent: 'true',
    locale: 'en',
    width: '100%',
    height: 400,
    interval: '1h',
    largeChartUrl: '',
});

export const COMPANY_PROFILE_WIDGET_CONFIG = (symbol: string) => ({
    symbol: getTradingViewSymbol(symbol),
    colorTheme: 'dark',
    isTransparent: 'true',
    locale: 'en',
    width: '100%',
    height: 440,
});

export const COMPANY_FINANCIALS_WIDGET_CONFIG = (symbol: string) => ({
    symbol: getTradingViewSymbol(symbol),
    colorTheme: 'dark',
    isTransparent: 'true',
    locale: 'en',
    width: '100%',
    height: 464,
    displayMode: 'regular',
    largeChartUrl: '',
});

export const POPULAR_STOCK_SYMBOLS = [
    // Banking & Financial
    'HDFCBANK.NS',
    'ICICIBANK.NS',
    'SBIN.NS',
    'AXISBANK.NS',
    'KOTAKBANK.NS',
    'BAJFINANCE.NS',

    // Technology
    'TCS.NS',
    'INFY.NS',
    'HCLTECH.NS',
    'WIPRO.NS',
    'TECHM.NS',
    'LTIM.NS',

    // Energy & Conglomerates
    'RELIANCE.NS',
    'ONGC.NS',
    'NTPC.NS',
    'POWERGRID.NS',
    'ADANIENT.NS',

    // Consumer & FMCG
    'ITC.NS',
    'HINDUNILVR.NS',
    'NESTLEIND.NS',
    'ASIANPAINT.NS',
    'TITAN.NS',

    // Automobile
    'MARUTI.NS',
    'TATAMOTORS.NS',
    'M&M.NS',
    'EICHERMOT.NS',
    'BAJAJ-AUTO.NS',

    // Telecom & Services
    'BHARTIARTL.NS',
    'INDIGO.NS',
    'IRCTC.NS',

    // Infrastructure / Industrial
    'LT.NS',
    'ULTRACEMCO.NS',
    'TATASTEEL.NS',
    'JSWSTEEL.NS',
    'ADANIPORTS.NS',
];

export const NO_MARKET_NEWS =
    '<p class="mobile-text" style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4b5563;">No market news available today. Please check back tomorrow.</p>';

export const WATCHLIST_TABLE_HEADER = [
    'Company',
    'Symbol',
    'Price',
    'Change',
    'Market Cap',
    'P/E Ratio',
    'Alert',
    'Action',
];