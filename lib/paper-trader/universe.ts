/**
 * NSE large caps the paper trader looks at for new buys. Every scan fetches a live quote for
 * each of these, and both Gemini and the rule-based fallback pick from this list.
 *
 * Tata Motors was split in 2025: the old TATAMOTORS.NS ticker is delisted, and the passenger
 * vehicle business now trades as TMPV.NS.
 */
export const PAPER_TRADER_UNIVERSE: { symbol: string; name: string }[] = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd' },
    { symbol: 'TMPV.NS', name: 'Tata Motors Passenger Vehicles Ltd' },
    { symbol: 'ITC.NS', name: 'ITC Ltd' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd' },
];
