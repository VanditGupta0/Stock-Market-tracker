import type { IPaperPosition, INewsCatalyst } from '@/database/models/paperTrader.model';
import { levelsFor, type RiskSettings } from '@/lib/paper-trader/riskRules';
import { PAPER_TRADER_UNIVERSE } from '@/lib/paper-trader/universe';
import { QUOTE_SOURCE_LABEL, type LiveQuote } from '@/lib/market/liveQuotes';

/**
 * How the paper trader decides what to trade: Gemini first, and a rule-based fallback that
 * uses only live prices when Gemini can't be used. Execution lives in the scan route.
 */

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

function getGeminiKey() {
    return process.env.GEMINI_API_KEY ?? '';
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

// ---- Finnhub news ----

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

// ---- Trade decisions ----

export interface TradeDecision {
    action: 'BUY' | 'SELL' | 'HOLD';
    symbol: string;
    company: string;
    shares: number;
    strategy: string;
    thoughtProcess: string;
    confidenceScore: number;
    riskReward: string;
    newsCatalyst: INewsCatalyst;
    marketTrend: {
        trendName: string;
        indicators: string[];
        supportResistance: string;
        timeframe: string;
        volumeProfile: string;
    };
}

const SENTIMENTS: INewsCatalyst['sentiment'][] = ['BULLISH', 'VERY_BULLISH', 'BEARISH', 'NEUTRAL'];

const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Turns one item of Gemini's JSON into a decision, or null when it is not a usable trade. */
export function normalizeDecision(raw: unknown): TradeDecision | null {
    if (!raw || typeof raw !== 'object') return null;
    const d = raw as Record<string, unknown>;

    const action = d.action === 'BUY' || d.action === 'SELL' ? d.action : null;
    const symbol = str(d.symbol, '').toUpperCase();
    const shares = Math.floor(num(d.shares, 0));
    if (!action || !symbol || shares < 1) return null;

    const news = (d.newsCatalyst ?? {}) as Record<string, unknown>;
    const trend = (d.marketTrend ?? {}) as Record<string, unknown>;
    const sentiment = SENTIMENTS.includes(news.sentiment as INewsCatalyst['sentiment'])
        ? (news.sentiment as INewsCatalyst['sentiment'])
        : 'NEUTRAL';

    return {
        action,
        symbol,
        company: str(d.company, ''),
        shares,
        strategy: str(d.strategy, 'AI Signal'),
        thoughtProcess: str(d.thoughtProcess, 'Trade suggested by Gemini.'),
        confidenceScore: Math.min(100, Math.max(0, Math.round(num(d.confidenceScore, 60)))),
        riskReward: str(d.riskReward, 'n/a'),
        newsCatalyst: {
            headline: str(news.headline, 'No specific news catalyst'),
            source: str(news.source, 'Gemini'),
            summary: str(news.summary, 'Decision based on live prices and current positions.'),
            sentiment,
            impactScore: Math.min(100, Math.max(0, Math.round(num(news.impactScore, 50)))),
            url: str(news.url, ''),
        },
        marketTrend: {
            trendName: str(trend.trendName, 'Not specified'),
            indicators: Array.isArray(trend.indicators)
                ? trend.indicators.filter((i): i is string => typeof i === 'string')
                : [],
            supportResistance: str(trend.supportResistance, ''),
            timeframe: str(trend.timeframe, 'Daily'),
            volumeProfile: str(trend.volumeProfile, 'Not analysed'),
        },
    };
}

/**
 * Asks Gemini for trades. Returns null when Gemini could not be used (no key, HTTP error,
 * unreadable reply), and an empty array when Gemini looked and chose not to trade.
 */
export async function askGeminiForTrades(
    news: FinnhubNewsArticle[],
    positions: IPaperPosition[],
    cash: number,
    budget: number,
    quotes: Map<string, LiveQuote>
): Promise<TradeDecision[] | null> {
    const geminiKey = getGeminiKey();
    if (!geminiKey) return null;

    const positionsSummary = positions.map((p) => ({
        symbol: p.symbol,
        company: p.company,
        shares: p.shares,
        avgBuyPriceInr: p.avgBuyPrice,
        livePriceInr: p.currentPrice,
        unrealizedProfitPercent: round2(p.unrealizedProfitPercent),
    }));

    const livePrices = PAPER_TRADER_UNIVERSE.flatMap(({ symbol, name }) => {
        const q = quotes.get(symbol);
        if (!q) return [];
        return [{
            symbol,
            company: name,
            priceInr: q.priceInInr,
            changeTodayPercent: q.changePercent === null ? null : round2(q.changePercent),
        }];
    });

    const newsSummary = news.map((n) => ({
        headline: n.headline,
        summary: n.summary?.substring(0, 180),
        source: n.source,
        url: n.url,
    }));

    const prompt = `You are a disciplined AI stock paper-trader managing a virtual INR portfolio. Make calculated, high-conviction trades and avoid overtrading.
Account Cash: ₹${round2(cash)} | Total Budget: ₹${budget}
Current Positions (live prices): ${JSON.stringify(positionsSummary)}
Stocks you may buy, with live NSE prices: ${JSON.stringify(livePrices)}
Latest Market News: ${JSON.stringify(newsSummary)}

Rules:
- Only BUY symbols from the list of stocks you may buy. Only SELL symbols you currently hold.
- Trades execute at the live prices above, so size them from those prices: each BUY should use 10% to 25% of available cash.
- Stop-loss and take-profit levels are set automatically by the account's risk rules.
- If a trade is driven by a news item, copy that article's headline, source and url into newsCatalyst. Never invent news. If no article applies, say so in the headline and leave url empty.
- Idle cash earns nothing. When more than half of the budget is in cash, open 1-2 positions in the strongest setups unless the news is clearly negative for the market.
- Otherwise, if nothing is compelling, return an empty array [].

Respond with ONLY a JSON array of trade objects:
[{
  "action": "BUY" or "SELL",
  "symbol": "SYMBOL.NS",
  "company": "Company Name",
  "shares": 10,
  "strategy": "Short strategy name",
  "thoughtProcess": "2-3 sentence rationale citing the live price, today's change and any news catalyst.",
  "confidenceScore": 75,
  "riskReward": "1:2",
  "newsCatalyst": {
    "headline": "...",
    "source": "...",
    "summary": "...",
    "sentiment": "BULLISH" | "VERY_BULLISH" | "BEARISH" | "NEUTRAL",
    "impactScore": 70,
    "url": ""
  },
  "marketTrend": {
    "trendName": "...",
    "indicators": ["..."],
    "supportResistance": "...",
    "timeframe": "Swing / 2-4 Weeks",
    "volumeProfile": "..."
  }
}]`;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 3000,
                    },
                }),
                signal: AbortSignal.timeout(30000),
            }
        );

        if (!res.ok) {
            console.error(`Paper trader: Gemini returned HTTP ${res.status}`);
            return null;
        }
        const data = await res.json();
        // The reply can arrive split across several parts, so join them all before parsing.
        const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
        const text = parts.map((p) => p.text ?? '').join('');
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) return null;
        return parsed.map(normalizeDecision).filter((d): d is TradeDecision => d !== null);
    } catch (err) {
        console.error('Paper trader: Gemini request failed', err);
        return null;
    }
}

/**
 * Fallback when Gemini is unavailable. Uses only live prices, never made-up news:
 * - sells 75% of one position that is up 8% or more from its average buy price;
 * - buys up to two stocks from the universe that are rising today, strongest first.
 */
export function ruleBasedDecisions(
    positions: IPaperPosition[],
    cash: number,
    budget: number,
    quotes: Map<string, LiveQuote>,
    risk: RiskSettings
): TradeDecision[] {
    const decisions: TradeDecision[] = [];

    const winner = positions.find((p) => p.unrealizedProfitPercent >= 8);
    if (winner) {
        const quote = quotes.get(winner.symbol);
        const dayChange = quote?.changePercent;
        decisions.push({
            action: 'SELL',
            symbol: winner.symbol,
            company: winner.company,
            shares: Math.max(1, Math.floor(winner.shares * 0.75)),
            strategy: 'Partial profit-taking',
            thoughtProcess: `Rule-based fallback (Gemini was unavailable). ${winner.symbol} trades at ${inr(winner.currentPrice)}, ${pct(winner.unrealizedProfitPercent)} from the average buy price of ${inr(winner.avgBuyPrice)}. Selling 75% locks in part of the gain and frees cash.`,
            confidenceScore: 60,
            riskReward: 'n/a',
            newsCatalyst: {
                headline: `${winner.symbol} is ${pct(winner.unrealizedProfitPercent)} above your average buy price`,
                source: 'Rule engine (live price)',
                summary: 'No news was used for this decision. It is based only on the live price and your entry price.',
                sentiment: 'NEUTRAL',
                impactScore: 0,
                url: '',
            },
            marketTrend: {
                trendName: 'Unrealized gain of 8% or more',
                indicators: [
                    `Gain: ${pct(winner.unrealizedProfitPercent)}`,
                    ...(typeof dayChange === 'number' ? [`Today: ${pct(dayChange)}`] : []),
                ],
                supportResistance: `Average buy: ${inr(winner.avgBuyPrice)}`,
                timeframe: 'Swing exit',
                volumeProfile: 'Not analysed',
            },
        });
    }

    const held = new Set(positions.map((p) => p.symbol.toUpperCase()));
    const risers = PAPER_TRADER_UNIVERSE.flatMap(({ symbol, name }) => {
        const quote = quotes.get(symbol);
        if (!quote || held.has(symbol) || quote.changePercent === null || quote.changePercent <= 0) return [];
        return [{ symbol, name, quote, change: quote.changePercent }];
    })
        .sort((a, b) => b.change - a.change)
        .slice(0, 2);

    let cashLeft = cash;
    for (const { symbol, name, quote, change } of risers) {
        const allocation = Math.min(cashLeft * 0.4, budget * 0.25, cashLeft * 0.85);
        const shares = Math.floor(allocation / quote.priceInInr);
        if (shares < 1) continue;
        cashLeft -= shares * quote.priceInInr;

        const levels = levelsFor(quote.priceInInr, risk);
        const rank = decisions.some((d) => d.action === 'BUY') ? 'second-strongest' : 'strongest';
        decisions.push({
            action: 'BUY',
            symbol,
            company: name,
            shares,
            strategy: 'Intraday momentum',
            thoughtProcess: `Rule-based fallback (Gemini was unavailable). ${name} is ${pct(change)} today at ${inr(quote.priceInInr)}, the ${rank} gainer among the tracked NSE large caps that you do not already hold. The position is sized at about ${Math.round(((shares * quote.priceInInr) / cash) * 100)}% of cash, with stop-loss and take-profit from your risk rules.`,
            confidenceScore: 55,
            riskReward: `${risk.stopLossPercent}% stop / ${risk.takeProfitPercent}% target`,
            newsCatalyst: {
                headline: `${name} is ${pct(change)} today`,
                source: `Live quote (${QUOTE_SOURCE_LABEL[quote.source]})`,
                summary: 'No news was used for this decision. It is based only on today’s live price move.',
                sentiment: 'BULLISH',
                impactScore: 0,
                url: '',
            },
            marketTrend: {
                trendName: 'Positive intraday momentum',
                indicators: [`Today: ${pct(change)}`, `Price: ${inr(quote.priceInInr)}`],
                supportResistance: `Stop: ${inr(levels.stopLoss)} | Target: ${inr(levels.targetPrice)}`,
                timeframe: 'Swing',
                volumeProfile: 'Not analysed',
            },
        });
    }

    return decisions;
}
