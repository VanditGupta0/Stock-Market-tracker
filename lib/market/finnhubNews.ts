/** General market news from Finnhub (latest 15 articles). Used by the AI Trader agent. */

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubNewsArticle {
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
    category?: string;
    related?: string;
}

export async function fetchFinnhubNews(token: string): Promise<FinnhubNewsArticle[]> {
    if (!token) return [];
    try {
        const res = await fetch(`${FINNHUB_BASE_URL}/news?category=general&token=${token}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (Array.isArray(data) ? data : []).slice(0, 15);
    } catch {
        return [];
    }
}
