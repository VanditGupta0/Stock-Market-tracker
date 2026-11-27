/**
 * NSE large caps the AI Trader agent may buy. Every cycle fetches a live quote for each of
 * these, and the code rejects any Gemini BUY for a symbol that is not on this list.
 *
 * Tata Motors was split in 2025: the old TATAMOTORS.NS ticker is delisted, and the passenger
 * vehicle business now trades as TMPV.NS.
 */
export const AGENT_UNIVERSE: { symbol: string; name: string; sector: string }[] = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Energy & Telecom' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT Services' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd', sector: 'IT Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Banking' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Banking' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'Financial Services' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecommunications' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },
    { symbol: 'TMPV.NS', name: 'Tata Motors Passenger Vehicles Ltd', sector: 'Automobiles' },
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Metals & Mining' },
    { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'FMCG' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
];

export const AGENT_UNIVERSE_BY_SYMBOL = new Map(AGENT_UNIVERSE.map((s) => [s.symbol, s]));
