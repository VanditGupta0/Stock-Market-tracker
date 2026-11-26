import { getRateToBase } from '@/lib/agent/currency';

/**
 * Live stock quotes for server-side code.
 *
 * - Indian listings (`.NS` / `.BO`) come from Yahoo Finance, because Finnhub's free plan
 *   returns 403 for them.
 * - Everything else tries Finnhub first and falls back to Yahoo Finance.
 *
 * Prices are also converted to INR (`priceInInr`), the currency the paper trader keeps its
 * books in. A quote in a currency we have no INR rate for is treated as unavailable.
 */

export type QuoteSource = 'yahoo' | 'finnhub';

export interface LiveQuote {
    symbol: string;
    name?: string;
    /** Price in the listing's own currency. */
    price: number;
    currency: string;
    /** Price converted to INR. */
    priceInInr: number;
    /** Change from the previous close, in percent, when the source provides it. */
    changePercent: number | null;
    /** When the exchange last traded at this price (the last close when the market is shut). */
    asOf: Date;
    source: QuoteSource;
}

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const REQUEST_TIMEOUT_MS = 8000;

// Yahoo answers requests without a browser-style User-Agent with HTTP 429.
const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0' };

export const QUOTE_SOURCE_LABEL: Record<QuoteSource, string> = {
    yahoo: 'Yahoo Finance',
    finnhub: 'Finnhub',
};

function getFinnhubToken() {
    return process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';
}

export function isIndianSymbol(symbol: string) {
    return /\.(NS|BO)$/i.test(symbol);
}

function toInr(amount: number, currency: string): number | null {
    try {
        return Math.round(amount * getRateToBase(currency) * 100) / 100;
    } catch {
        return null;
    }
}

async function fetchYahooQuote(symbol: string): Promise<LiveQuote | null> {
    try {
        const res = await fetch(
            `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
            { headers: YAHOO_HEADERS, cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
        );
        if (!res.ok) return null;

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const price = Number(meta?.regularMarketPrice);
        const currency = typeof meta?.currency === 'string' ? meta.currency : '';
        if (!(price > 0) || !currency) return null;

        const priceInInr = toInr(price, currency);
        if (priceInInr === null) return null;

        const previousClose = Number(meta.chartPreviousClose ?? meta.previousClose);
        const tradedAt = Number(meta.regularMarketTime);

        return {
            symbol,
            name: meta.longName ?? meta.shortName ?? undefined,
            price,
            currency,
            priceInInr,
            changePercent: previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : null,
            asOf: tradedAt > 0 ? new Date(tradedAt * 1000) : new Date(),
            source: 'yahoo',
        };
    } catch {
        return null;
    }
}

async function fetchFinnhubQuote(symbol: string): Promise<LiveQuote | null> {
    const token = getFinnhubToken();
    if (!token) return null;

    try {
        const res = await fetch(
            `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
            { cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
        );
        if (!res.ok) return null;

        const data = await res.json();
        const price = Number(data?.c);
        if (!(price > 0)) return null;

        // Finnhub's free plan only covers US listings, which are quoted in USD.
        const priceInInr = toInr(price, 'USD');
        if (priceInInr === null) return null;

        const tradedAt = Number(data.t);

        return {
            symbol,
            price,
            currency: 'USD',
            priceInInr,
            changePercent: typeof data.dp === 'number' ? data.dp : null,
            asOf: tradedAt > 0 ? new Date(tradedAt * 1000) : new Date(),
            source: 'finnhub',
        };
    } catch {
        return null;
    }
}

/** Live quote for one symbol, or null when no source has a usable price. */
export async function getLiveQuote(rawSymbol: string): Promise<LiveQuote | null> {
    const symbol = rawSymbol.trim().toUpperCase();
    if (!symbol) return null;

    if (isIndianSymbol(symbol)) return fetchYahooQuote(symbol);
    return (await fetchFinnhubQuote(symbol)) ?? (await fetchYahooQuote(symbol));
}

/** Live quotes for several symbols in parallel, keyed by upper-case symbol. Missing ones are left out. */
export async function getLiveQuotes(symbols: string[]): Promise<Map<string, LiveQuote>> {
    const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];
    const results = await Promise.all(unique.map(getLiveQuote));

    const quotes = new Map<string, LiveQuote>();
    unique.forEach((symbol, i) => {
        const quote = results[i];
        if (quote) quotes.set(symbol, quote);
    });
    return quotes;
}
