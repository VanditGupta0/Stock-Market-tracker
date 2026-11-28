import type {
    AgentPortfolioDoc,
    IAgentPosition,
    IAgentReasoning,
    IAgentThought,
    IAgentTrade,
} from '@/database/models/agentPortfolio.model';
import { getLiveQuotes, QUOTE_SOURCE_LABEL, type LiveQuote } from '@/lib/market/liveQuotes';
import { fetchFinnhubNews, type FinnhubNewsArticle } from '@/lib/market/finnhubNews';
import { AGENT_UNIVERSE, AGENT_UNIVERSE_BY_SYMBOL } from './universe';
import {
    MAX_BUY_CASH_PERCENT,
    MAX_TRADES_PER_CYCLE,
    MIN_BUY_CASH_PERCENT,
    STRATEGIES,
    type StrategyConfig,
} from './strategy';

/**
 * The AI Trader agent. One cycle:
 *   1. fetches live NSE prices (Yahoo Finance) and live market news (Finnhub);
 *   2. revalues open positions and closes any that crossed their stop-loss or take-profit;
 *   3. asks Gemini for trades;
 *   4. checks every Gemini trade in code before executing it at the live price.
 *
 * Gemini's reply is never trusted. The checks in step 4:
 *   - BUY only symbols in AGENT_UNIVERSE, SELL only symbols that are held;
 *   - each BUY uses 10-25% of available cash and stays under the strategy's per-stock cap;
 *   - a cited news article must match one that was actually fetched, or the citation is dropped;
 *   - no trading a stock that was closed by stop-loss / take-profit earlier in the same cycle;
 *   - at most one trade per stock, and at most MAX_TRADES_PER_CYCLE trades, per cycle.
 *
 * If Gemini can't be used, the agent makes no new trades (risk exits still run).
 * The caller saves the document.
 */

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const CURRENCY = '₹';
const OPERATOR_NEWS_SOURCE = 'Operator breaking news (unverified)';

const round2 = (n: number) => Math.round(n * 100) / 100;
const inr = (n: number) => `${CURRENCY}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function getFinnhubToken() {
    return process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';
}

export interface CycleOptions {
    /** A headline typed into (or picked from) the breaking-news box. Treated as unverified. */
    breakingNews?: string;
}

export interface CycleResult {
    tradesExecuted: number;
    decisionSource: 'gemini' | 'unavailable';
    summary: string;
}

// ---- Gemini ----

interface GeminiTrade {
    action: 'BUY' | 'SELL';
    symbol: string;
    shares: number;
    thesis: string;
    marketTrend: string;
    newsHeadline: string;
    newsUrl: string;
    sentimentScore: number;
    confidence: number;
}

interface GeminiPlan {
    marketView: string;
    trades: GeminiTrade[];
    /** Items in Gemini's reply that were not usable trades (missing action, symbol or shares). */
    malformed: number;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function parseTrade(raw: unknown): GeminiTrade | null {
    if (!raw || typeof raw !== 'object') return null;
    const d = raw as Record<string, unknown>;
    const action = d.action === 'BUY' || d.action === 'SELL' ? d.action : null;
    const symbol = str(d.symbol).toUpperCase();
    const shares = Math.floor(num(d.shares, 0));
    if (!action || !symbol || shares < 1) return null;
    return {
        action,
        symbol,
        shares,
        thesis: str(d.thesis) || 'No rationale given.',
        marketTrend: str(d.marketTrend),
        newsHeadline: str(d.newsHeadline),
        newsUrl: str(d.newsUrl),
        sentimentScore: clamp(num(d.sentimentScore, 0), -1, 1),
        confidence: Math.round(clamp(num(d.confidence, 50), 0, 100)),
    };
}

async function askGemini(prompt: string): Promise<{ plan: GeminiPlan } | { error: string }> {
    const key = process.env.GEMINI_API_KEY ?? '';
    if (!key) return { error: 'GEMINI_API_KEY is not set' };

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 3000,
                        responseMimeType: 'application/json',
                    },
                }),
                signal: AbortSignal.timeout(30000),
            }
        );
        if (!res.ok) return { error: `Gemini returned HTTP ${res.status}` };

        const data = await res.json();
        const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
        const text = parts.map((p) => p.text ?? '').join('');
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned) as Record<string, unknown>;

        const rawTrades = Array.isArray(parsed?.trades) ? parsed.trades : null;
        if (!rawTrades) return { error: 'Gemini reply had no "trades" array' };

        const trades = rawTrades.map(parseTrade).filter((t): t is GeminiTrade => t !== null);
        return {
            plan: {
                marketView: str(parsed.marketView),
                trades,
                malformed: rawTrades.length - trades.length,
            },
        };
    } catch (err) {
        console.error('AI Trader: Gemini request failed', err);
        return { error: 'Gemini request failed or returned unreadable JSON' };
    }
}

function buildPrompt(args: {
    doc: AgentPortfolioDoc;
    strategy: StrategyConfig;
    quotes: Map<string, LiveQuote>;
    news: FinnhubNewsArticle[];
    breakingNews?: string;
    closedThisCycle: string[];
}): string {
    const { doc, strategy, quotes, news, breakingNews, closedThisCycle } = args;

    const positions = doc.positions.map((p) => ({
        symbol: p.symbol,
        company: p.name,
        sector: p.sector,
        shares: p.shares,
        avgBuyPriceInr: p.averageBuyPrice,
        livePriceInr: p.currentPrice,
        unrealizedPercent: p.totalCost > 0 ? round2(((p.shares * p.currentPrice - p.totalCost) / p.totalCost) * 100) : 0,
    }));

    const buyable = AGENT_UNIVERSE.flatMap(({ symbol, name, sector }) => {
        const q = quotes.get(symbol);
        if (!q || closedThisCycle.includes(symbol)) return [];
        return [{
            symbol,
            company: name,
            sector,
            priceInr: q.priceInInr,
            changeTodayPercent: q.changePercent === null ? null : round2(q.changePercent),
        }];
    });

    const newsList = news.map((n) => ({
        headline: n.headline,
        source: n.source,
        url: n.url,
        summary: n.summary?.substring(0, 200),
    }));

    const maxPosition = round2((doc.totalCapital * strategy.maxPositionPercent) / 100);

    return `You are an autonomous AI equity trader managing a virtual INR paper portfolio of NSE stocks. Make calculated, high-conviction trades and avoid overtrading.

Strategy: ${strategy.promptGuidance}
Total capital: ${inr(doc.totalCapital)} | Cash available: ${inr(doc.cash)}
Limits enforced by the system: each BUY uses ${MIN_BUY_CASH_PERCENT}-${MAX_BUY_CASH_PERCENT}% of cash; at most ${inr(maxPosition)} (${strategy.maxPositionPercent}% of capital) in one stock; stop-loss -${strategy.stopLossPercent}% and take-profit +${strategy.takeProfitPercent}% are set automatically; at most ${MAX_TRADES_PER_CYCLE} trades.

Current positions (live prices): ${JSON.stringify(positions)}
Stocks you may BUY, with live NSE prices: ${JSON.stringify(buyable)}
Latest market news (fetched live): ${JSON.stringify(newsList)}
${breakingNews ? `Breaking headline from the operator (hypothetical, NOT verified; weigh it as a scenario to react to): ${JSON.stringify(breakingNews)}\n` : ''}${closedThisCycle.length ? `Closed this cycle by stop-loss/take-profit, do not trade: ${closedThisCycle.join(', ')}\n` : ''}
Rules:
- Only BUY symbols from the list of stocks you may buy. Only SELL symbols you currently hold, and no more shares than you hold.
- At most one trade per symbol.
- Size BUYs from the live prices above so they fall within the cash limits.
- If a trade is driven by a news item, copy that item's headline and url EXACTLY into newsHeadline and newsUrl. For the operator's breaking headline, copy it into newsHeadline and leave newsUrl empty. Never invent news; if no item applies, leave both empty.
- Idle cash earns nothing. When more than half of capital is in cash, open 1-2 positions in the strongest setups unless the news is clearly negative.
- Otherwise, if nothing is compelling, return an empty trades array.

Respond with ONLY this JSON object:
{
  "marketView": "1-2 sentences on the overall market read from the news and prices.",
  "trades": [{
    "action": "BUY" or "SELL",
    "symbol": "SYMBOL.NS",
    "shares": 10,
    "thesis": "2-3 sentences on why, citing the live price, today's change and any news.",
    "marketTrend": "1-2 sentences on the price action, using only the live price and today's change.",
    "newsHeadline": "",
    "newsUrl": "",
    "sentimentScore": 0.5,
    "confidence": 70
  }]
}
sentimentScore is from -1 (very bearish) to 1 (very bullish); confidence is 0-100.`;
}

// ---- Helpers ----

function sentimentLabel(score: number): string {
    if (score >= 0.6) return 'Strongly Bullish';
    if (score >= 0.2) return 'Bullish';
    if (score > -0.2) return 'Neutral';
    if (score > -0.6) return 'Bearish';
    return 'Strongly Bearish';
}

/**
 * Checks a news citation against the articles fetched this cycle. A citation that matches
 * neither a fetched article (by url or exact headline) nor the operator's breaking headline is
 * dropped, so a made-up article never shows on a trade card.
 */
function verifyNews(
    headline: string,
    url: string,
    articles: FinnhubNewsArticle[],
    breakingNews?: string
): { catalyst: string; source?: string; url?: string; status: 'verified' | 'none' | 'operator' | 'dropped' } {
    if (!headline && !url) {
        return { catalyst: 'No news catalyst cited. Decision based on live price action.', status: 'none' };
    }

    const article =
        (url && articles.find((a) => a.url && a.url.trim() === url)) ||
        (headline && articles.find((a) => a.headline && normalize(a.headline) === normalize(headline))) ||
        null;
    if (article) {
        const safeUrl = /^https?:\/\//i.test(article.url ?? '') ? article.url : undefined;
        return { catalyst: article.headline, source: article.source, url: safeUrl, status: 'verified' };
    }

    if (breakingNews && headline && normalize(headline) === normalize(breakingNews)) {
        return { catalyst: breakingNews, source: OPERATOR_NEWS_SOURCE, status: 'operator' };
    }

    return {
        catalyst: 'Gemini cited an article that was not in the fetched news feed, so the citation was removed.',
        status: 'dropped',
    };
}

function levelsFor(price: number, strategy: StrategyConfig) {
    return {
        stopLoss: round2(price * (1 - strategy.stopLossPercent / 100)),
        targetPrice: round2(price * (1 + strategy.takeProfitPercent / 100)),
    };
}

// ---- The cycle ----

export async function runAgentCycle(doc: AgentPortfolioDoc, options: CycleOptions = {}): Promise<CycleResult> {
    const strategy = STRATEGIES[doc.strategy] ?? STRATEGIES.balanced;
    const breakingNews = options.breakingNews?.trim().slice(0, 300) || undefined;
    const thoughts: IAgentThought[] = [];
    const think = (phase: IAgentThought['phase'], message: string) =>
        thoughts.push({ step: thoughts.length + 1, phase, message, at: new Date() });

    let tradesExecuted = 0;
    const tradedThisCycle = new Set<string>();

    const record = (trade: IAgentTrade) => {
        doc.tradeHistory.unshift(trade);
        doc.totalTrades += 1;
        tradesExecuted += 1;
        tradedThisCycle.add(trade.symbol);
    };

    /** Sells `shares` of the position at `index` at `price`. Returns the realized P&L. */
    const sell = (index: number, shares: number, price: number, reasoning: Omit<IAgentReasoning, 'targetPrice' | 'stopLoss'>) => {
        const pos = doc.positions[index];
        const proceeds = round2(shares * price);
        const costOfShares = round2((pos.totalCost / pos.shares) * shares);
        const pnl = round2(proceeds - costOfShares);
        const pnlPercent = costOfShares > 0 ? round2((pnl / costOfShares) * 100) : 0;

        doc.cash = round2(doc.cash + proceeds);
        doc.realizedPnL = round2(doc.realizedPnL + pnl);
        doc.closedTrades += 1;
        if (pnl > 0) doc.winningTrades += 1;

        const trade: IAgentTrade = {
            id: newId('trade'),
            executedAt: new Date(),
            action: 'SELL',
            symbol: pos.symbol,
            name: pos.name,
            price,
            shares,
            totalAmount: proceeds,
            currency: CURRENCY,
            realizedPnL: pnl,
            realizedPnLPercent: pnlPercent,
            reasoning: { ...reasoning, targetPrice: pos.targetPrice, stopLoss: pos.stopLoss },
        };

        if (shares >= pos.shares) {
            doc.positions.splice(index, 1);
        } else {
            pos.shares -= shares;
            pos.totalCost = round2(pos.totalCost - costOfShares);
        }
        record(trade);
        return { pnl, pnlPercent, proceeds };
    };

    think(
        'Ingestion',
        `Cycle started in ${doc.strategy} mode. Capital ${inr(doc.totalCapital)}, cash ${inr(doc.cash)}, ${doc.positions.length} open position(s).`
    );

    // 1) Live data
    const [news, quotes] = await Promise.all([
        fetchFinnhubNews(getFinnhubToken()),
        getLiveQuotes([...doc.positions.map((p) => p.symbol), ...AGENT_UNIVERSE.map((s) => s.symbol)]),
    ]);
    const pricedUniverse = AGENT_UNIVERSE.filter((s) => quotes.has(s.symbol)).length;
    think(
        'Ingestion',
        `Fetched ${news.length} live news article(s) from Finnhub and live prices for ${pricedUniverse} of ${AGENT_UNIVERSE.length} NSE stocks.`
    );
    if (breakingNews) think('Ingestion', `Operator breaking headline (unverified): "${breakingNews}".`);

    // 2) Revalue positions, then apply stop-loss / take-profit
    const stale: string[] = [];
    for (const pos of doc.positions) {
        const q = quotes.get(pos.symbol.toUpperCase());
        if (q) {
            pos.currentPrice = q.priceInInr;
            pos.priceUpdatedAt = q.asOf;
        } else {
            stale.push(pos.symbol);
        }
    }
    think(
        'Valuation',
        doc.positions.length === 0
            ? 'No open positions to revalue.'
            : `Revalued ${doc.positions.length - stale.length} position(s) at live prices.${stale.length ? ` No live price for ${stale.join(', ')}, so the last known price was kept and no exit rules were applied to them.` : ''}`
    );

    const closedByRules: string[] = [];
    for (let i = doc.positions.length - 1; i >= 0; i--) {
        const pos = doc.positions[i];
        if (stale.includes(pos.symbol)) continue;
        const hitStop = pos.stopLoss > 0 && pos.currentPrice <= pos.stopLoss;
        const hitTarget = !hitStop && pos.targetPrice > 0 && pos.currentPrice >= pos.targetPrice;
        if (!hitStop && !hitTarget) continue;

        const label = hitStop ? 'Stop-loss' : 'Take-profit';
        const level = hitStop ? pos.stopLoss : pos.targetPrice;
        const price = pos.currentPrice;
        const shares = pos.shares;
        const symbol = pos.symbol;
        const pnlPreview = round2(shares * price - pos.totalCost);

        const { pnl, pnlPercent } = sell(i, shares, price, {
            thesis: `${label} triggered. ${symbol} traded at ${inr(price)}, past the ${label.toLowerCase()} level of ${inr(level)}, so the whole position was closed automatically.`,
            newsCatalyst: 'Exit triggered by the strategy’s risk rules, not by news.',
            marketTrend: `Live price ${inr(price)} vs average buy price ${inr(pos.averageBuyPrice)} (${pct(pos.totalCost > 0 ? (pnlPreview / pos.totalCost) * 100 : 0)}).`,
            sentimentScore: 0,
            sentimentLabel: 'Neutral',
            riskAssessment: `${label} at ${hitStop ? '-' : '+'}${hitStop ? strategy.stopLossPercent : strategy.takeProfitPercent}% from entry.`,
            allocationReason: `Sold all ${shares} share(s).`,
            confidence: 100,
        });
        closedByRules.push(symbol);
        think(
            'Execution',
            `EXECUTED SELL (${label.toLowerCase()}): ${symbol} x ${shares} @ ${inr(price)}. Realized ${pnl >= 0 ? '+' : ''}${inr(pnl)} (${pct(pnlPercent)}).`
        );
    }
    if (closedByRules.length === 0 && doc.positions.length > 0) {
        think('Valuation', `No position crossed its stop-loss (-${strategy.stopLossPercent}%) or take-profit (+${strategy.takeProfitPercent}%).`);
    }

    // 3) Ask Gemini
    think('Analysis', `Asking Gemini (${GEMINI_MODEL}) for trades based on live prices, live news and current holdings.`);
    const reply = await askGemini(
        buildPrompt({ doc, strategy, quotes, news, breakingNews, closedThisCycle: closedByRules })
    );

    if ('error' in reply) {
        think('Analysis', `Gemini could not be used (${reply.error}). No new trades were placed this cycle.`);
        const summary = `${closedByRules.length ? `Closed ${closedByRules.length} position(s) by risk rules. ` : ''}Gemini was unavailable, so the agent made no new trades.`;
        think('Execution', summary);
        doc.lastThoughts = thoughts;
        doc.lastCycleAt = new Date();
        return { tradesExecuted, decisionSource: 'unavailable', summary };
    }

    const { plan } = reply;
    if (plan.marketView) think('Analysis', `Gemini's market view: ${plan.marketView}`);
    think(
        'Analysis',
        plan.trades.length === 0
            ? `Gemini proposed no trades.${plan.malformed ? ` ${plan.malformed} item(s) in its reply were malformed and ignored.` : ''}`
            : `Gemini proposed ${plan.trades.length} trade(s): ${plan.trades.map((t) => `${t.action} ${t.shares} ${t.symbol}`).join(', ')}.${plan.malformed ? ` ${plan.malformed} malformed item(s) were ignored.` : ''}`
    );

    // 4) Check and execute each proposal
    let geminiTrades = 0;
    let rejected = 0;
    const reject = (t: GeminiTrade, reason: string) => {
        rejected += 1;
        think('Risk Sizing', `Rejected ${t.action} ${t.symbol}: ${reason}`);
    };

    for (const t of plan.trades) {
        if (geminiTrades >= MAX_TRADES_PER_CYCLE) {
            reject(t, `the limit of ${MAX_TRADES_PER_CYCLE} trades per cycle was reached.`);
            continue;
        }
        if (closedByRules.includes(t.symbol)) {
            reject(t, 'it was closed by stop-loss / take-profit earlier in this cycle.');
            continue;
        }
        if (tradedThisCycle.has(t.symbol)) {
            reject(t, 'it was already traded in this cycle.');
            continue;
        }

        const citation = verifyNews(t.newsHeadline, t.newsUrl, news, breakingNews);
        if (citation.status === 'dropped') {
            think('Risk Sizing', `${t.symbol}: Gemini cited "${t.newsHeadline || t.newsUrl}", which is not in the fetched news, so the citation was removed.`);
        }
        const baseReasoning = {
            thesis: t.thesis,
            newsCatalyst: citation.catalyst,
            newsSource: citation.source,
            newsUrl: citation.url,
            marketTrend: t.marketTrend || 'No trend commentary given.',
            sentimentScore: t.sentimentScore,
            sentimentLabel: sentimentLabel(t.sentimentScore),
            confidence: t.confidence,
        };

        if (t.action === 'BUY') {
            const listing = AGENT_UNIVERSE_BY_SYMBOL.get(t.symbol);
            if (!listing) {
                reject(t, 'it is not on the list of stocks the agent may buy.');
                continue;
            }
            const quote = quotes.get(t.symbol);
            if (!quote) {
                reject(t, 'no live price is available.');
                continue;
            }
            const price = quote.priceInInr;

            const existing = doc.positions.find((p) => p.symbol === t.symbol);
            const positionCap = (doc.totalCapital * strategy.maxPositionPercent) / 100;
            const roomInPosition = positionCap - (existing?.totalCost ?? 0);
            const minSpend = (doc.cash * MIN_BUY_CASH_PERCENT) / 100;
            const maxSpend = Math.min((doc.cash * MAX_BUY_CASH_PERCENT) / 100, roomInPosition);

            if (roomInPosition < minSpend) {
                reject(
                    t,
                    `only ${inr(Math.max(0, roomInPosition))} is left under the ${strategy.maxPositionPercent}% per-stock cap, less than the ${MIN_BUY_CASH_PERCENT}% minimum buy (${inr(minSpend)}).`
                );
                continue;
            }

            const requested = t.shares * price;
            const spend = Math.min(Math.max(requested, minSpend), maxSpend);
            // The epsilon stops float error (e.g. 561950 / 1123.9 = 499.999...) from dropping a share.
            let shares = Math.floor(spend / price + 1e-9);
            // Rounding down can land just under the minimum; add a share if that still fits.
            if (shares * price < minSpend && (shares + 1) * price <= maxSpend) shares += 1;
            if (shares < 1 || shares * price < minSpend) {
                reject(
                    t,
                    shares < 1
                        ? `one share (${inr(price)}) is more than the ${inr(maxSpend)} this buy may use.`
                        : `whole shares at ${inr(price)} can't land within ${MIN_BUY_CASH_PERCENT}-${MAX_BUY_CASH_PERCENT}% of cash.`
                );
                continue;
            }
            if (shares !== t.shares) {
                think(
                    'Risk Sizing',
                    `Resized BUY ${t.symbol} from ${t.shares} to ${shares} share(s) to stay within ${MIN_BUY_CASH_PERCENT}-${MAX_BUY_CASH_PERCENT}% of cash and the ${strategy.maxPositionPercent}% per-stock cap.`
                );
            }

            const cost = round2(shares * price);
            const cashBefore = doc.cash;
            let target: number;
            let stop: number;
            if (existing) {
                existing.shares += shares;
                existing.totalCost = round2(existing.totalCost + cost);
                existing.averageBuyPrice = round2(existing.totalCost / existing.shares);
                existing.currentPrice = price;
                existing.priceUpdatedAt = quote.asOf;
                ({ stopLoss: stop, targetPrice: target } = levelsFor(existing.averageBuyPrice, strategy));
                existing.stopLoss = stop;
                existing.targetPrice = target;
                existing.thesis = t.thesis;
            } else {
                ({ stopLoss: stop, targetPrice: target } = levelsFor(price, strategy));
                const position: IAgentPosition = {
                    symbol: t.symbol,
                    name: listing.name,
                    sector: listing.sector,
                    currency: CURRENCY,
                    shares,
                    averageBuyPrice: price,
                    currentPrice: price,
                    priceUpdatedAt: quote.asOf,
                    totalCost: cost,
                    targetPrice: target,
                    stopLoss: stop,
                    thesis: t.thesis,
                    boughtAt: new Date(),
                };
                doc.positions.push(position);
            }
            doc.cash = round2(Math.max(0, doc.cash - cost));

            record({
                id: newId('trade'),
                executedAt: new Date(),
                action: 'BUY',
                symbol: t.symbol,
                name: listing.name,
                price,
                shares,
                totalAmount: cost,
                currency: CURRENCY,
                reasoning: {
                    ...baseReasoning,
                    riskAssessment: `Take-profit at ${inr(target)} (+${strategy.takeProfitPercent}%) and stop-loss at ${inr(stop)} (-${strategy.stopLossPercent}%)${existing ? ' from the new average price' : ''}. Reward/risk ${(strategy.takeProfitPercent / strategy.stopLossPercent).toFixed(1)}:1.`,
                    allocationReason: `Spent ${inr(cost)} on ${shares} share(s) at the live price (${QUOTE_SOURCE_LABEL[quote.source]}), ${((cost / cashBefore) * 100).toFixed(1)}% of available cash.`,
                    targetPrice: target,
                    stopLoss: stop,
                },
            });
            geminiTrades += 1;
            think('Execution', `EXECUTED BUY: ${t.symbol} x ${shares} @ ${inr(price)} (${inr(cost)}).`);
            continue;
        }

        // SELL
        const index = doc.positions.findIndex((p) => p.symbol === t.symbol);
        if (index === -1) {
            reject(t, 'the agent does not hold it.');
            continue;
        }
        const quote = quotes.get(t.symbol);
        if (!quote) {
            reject(t, 'no live price is available.');
            continue;
        }
        const held = doc.positions[index].shares;
        const shares = Math.min(t.shares, held);
        if (shares !== t.shares) {
            think('Risk Sizing', `Reduced SELL ${t.symbol} from ${t.shares} to the ${held} share(s) held.`);
        }
        const { pnl, pnlPercent, proceeds } = sell(index, shares, quote.priceInInr, {
            ...baseReasoning,
            riskAssessment: `Discretionary exit chosen by Gemini at the live price of ${inr(quote.priceInInr)}.`,
            allocationReason: `Sold ${shares} of ${held} share(s) for ${inr(round2(shares * quote.priceInInr))}.`,
        });
        geminiTrades += 1;
        think(
            'Execution',
            `EXECUTED SELL: ${t.symbol} x ${shares} @ ${inr(quote.priceInInr)} (${inr(proceeds)}). Realized ${pnl >= 0 ? '+' : ''}${inr(pnl)} (${pct(pnlPercent)}).`
        );
    }

    const parts: string[] = [];
    parts.push(
        tradesExecuted > 0
            ? `Executed ${tradesExecuted} trade(s) at live prices.`
            : 'No trades this cycle.'
    );
    if (closedByRules.length) parts.push(`${closedByRules.length} closed by risk rules.`);
    if (rejected) parts.push(`${rejected} Gemini proposal(s) rejected by safety checks.`);
    if (plan.malformed && plan.trades.length === 0) parts.push('Gemini’s reply had no usable trades.');
    const summary = parts.join(' ');
    think('Execution', summary);

    doc.lastThoughts = thoughts;
    doc.lastCycleAt = new Date();
    return { tradesExecuted, decisionSource: 'gemini', summary };
}
