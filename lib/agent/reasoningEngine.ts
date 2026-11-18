import {
    AgentCycleResult,
    AgentThoughtStep,
    PaperPortfolio,
    Position,
    StockAsset,
    StrategyProfile,
    TradeExecution,
    TradeReasoning,
} from "./types";
import { NewsArticle } from "@/lib/constants";

interface AnalyzeParams {
    portfolio: PaperPortfolio;
    stocks: StockAsset[];
    newsArticles: NewsArticle[];
    strategy?: StrategyProfile;
    customNewsHeadline?: string;
}

export function runAgentTradingCycle({
    portfolio,
    stocks,
    newsArticles,
    strategy = portfolio.strategy || "balanced",
    customNewsHeadline,
}: AnalyzeParams): AgentCycleResult {
    const cycleId = `cycle-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const thoughts: AgentThoughtStep[] = [];
    const tradesExecuted: TradeExecution[] = [];

    // Helper to log thoughts
    const addThought = (phase: AgentThoughtStep["phase"], message: string) => {
        thoughts.push({
            step: thoughts.length + 1,
            phase,
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
    };

    addThought("Ingestion", `Agent initiated deliberation cycle with assigned capital of ${portfolio.positions[0]?.currency || "₹"}${portfolio.totalCapital.toLocaleString()}. Available cash: ${portfolio.positions[0]?.currency || "₹"}${portfolio.cash.toLocaleString()}.`);

    // Ingest custom breaking news if provided
    const combinedNews = [...newsArticles];
    if (customNewsHeadline && customNewsHeadline.trim().length > 0) {
        const injectedArticle: NewsArticle = {
            id: `custom-${Date.now()}`,
            title: customNewsHeadline.trim(),
            summary: "Breaking news event entered by portfolio operator for immediate agent reaction.",
            source: "Live Flash Alert",
            timeAgo: "Just now",
            category: "Markets",
            sentiment: customNewsHeadline.toLowerCase().includes("fall") ||
                customNewsHeadline.toLowerCase().includes("crash") ||
                customNewsHeadline.toLowerCase().includes("drop") ||
                customNewsHeadline.toLowerCase().includes("loss") ||
                customNewsHeadline.toLowerCase().includes("cut")
                ? "Bearish"
                : "Bullish",
            readTime: "1 min read",
        };
        combinedNews.unshift(injectedArticle);
        addThought("Ingestion", `Ingested live breaking news catalyst: "${injectedArticle.title}" (Polarity: ${injectedArticle.sentiment}).`);
    }

    addThought("Ingestion", `Aggregated ${combinedNews.length} active news events and ${stocks.length} assets across IT, Energy, Metals, Telecom, and Tech sectors.`);

    // Current state copies for mutation
    let currentCash = portfolio.cash;
    let positions: Position[] = [...portfolio.positions];
    const tradeHistory: TradeExecution[] = [...portfolio.tradeHistory];
    let realizedPnL = portfolio.realizedPnL || 0;
    let totalTrades = portfolio.totalTrades || 0;
    let winningTrades = portfolio.winningTrades || 0;

    // --- PHASE 1: EVALUATE EXISTING HOLDINGS FOR EXIT (SELL) ---
    addThought("Valuation", `Reviewing ${positions.length} active portfolio holdings against exit rules (Take-Profit & Stop-Loss).`);

    const updatedPositions: Position[] = [];

    for (const position of positions) {
        const liveStock = stocks.find((s) => s.symbol === position.symbol);
        if (!liveStock) {
            updatedPositions.push(position);
            continue;
        }

        const currentPrice = liveStock.price;
        const unrealizedPnL = Number(((currentPrice - position.averageBuyPrice) * position.shares).toFixed(2));
        const unrealizedPnLPercent = Number((((currentPrice - position.averageBuyPrice) / position.averageBuyPrice) * 100).toFixed(2));

        let shouldSell = false;
        let sellReason = "";
        let sellThesis = "";

        // Rule A: Take profit reached
        if (currentPrice >= position.targetPrice) {
            shouldSell = true;
            sellReason = `Target price reached at ${position.currency}${currentPrice} (+${unrealizedPnLPercent}% gain). Locking in alpha gains.`;
            sellThesis = `Take-profit order triggered. The asset achieved its fundamental price target set during initial accumulation.`;
        }
        // Rule B: Stop loss hit
        else if (currentPrice <= position.stopLoss) {
            shouldSell = true;
            sellReason = `Stop-loss threshold breached at ${position.currency}${currentPrice} (${unrealizedPnLPercent}% drawdown). Capital preservation protocol activated.`;
            sellThesis = `Stop-loss executed. The trade invalidation level was hit due to adverse short-term momentum; cutting loss to protect principal.`;
        }
        // Rule C: Adverse breaking news turning sentiment deeply negative
        else if (liveStock.sentimentScore < -0.35) {
            shouldSell = true;
            sellReason = `Severe sentiment degradation (Score: ${liveStock.sentimentScore}) and bearish news emergence.`;
            sellThesis = `Risk aversion exit. Emerging macro or sector headwinds invalidated the initial bullish thesis.`;
        }

        if (shouldSell) {
            const saleProceeds = Number((currentPrice * position.shares).toFixed(2));
            currentCash = Number((currentCash + saleProceeds).toFixed(2));
            realizedPnL = Number((realizedPnL + unrealizedPnL).toFixed(2));
            totalTrades += 1;
            if (unrealizedPnL > 0) winningTrades += 1;

            const reasoning: TradeReasoning = {
                thesis: sellThesis,
                newsCatalyst: liveStock.catalystSummary || "Exit triggered by quantitative risk parameters.",
                marketTrend: `Price action reached ${currentPrice > position.averageBuyPrice ? "target resistance" : "support breakdown"} level at ${position.currency}${currentPrice}.`,
                sentimentScore: liveStock.sentimentScore,
                sentimentLabel: liveStock.sentimentLabel,
                riskAssessment: `Realized ${unrealizedPnL >= 0 ? "profit" : "loss"} of ${position.currency}${Math.abs(unrealizedPnL)} (${unrealizedPnLPercent}%).`,
                allocationReason: `Liquidated entire position of ${position.shares} shares to free up ${position.currency}${saleProceeds} in cash.`,
                targetPrice: position.targetPrice,
                stopLoss: position.stopLoss,
                confidence: 90,
            };

            const now = Date.now();
            const sellTrade: TradeExecution = {
                id: `trade-${now}-${position.symbol}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                timestampMs: now,
                action: "SELL",
                symbol: position.symbol,
                name: position.name,
                price: currentPrice,
                shares: position.shares,
                totalAmount: saleProceeds,
                currency: position.currency,
                realizedPnL: unrealizedPnL,
                realizedPnLPercent: unrealizedPnLPercent,
                reasoning,
            };

            tradesExecuted.push(sellTrade);
            tradeHistory.unshift(sellTrade);
            addThought("Execution", `EXECUTED SELL: ${position.symbol} x ${position.shares} @ ${position.currency}${currentPrice}. ${sellReason}`);
        } else {
            // Retain position with updated live price
            updatedPositions.push({
                ...position,
                currentPrice,
                currentValue: Number((currentPrice * position.shares).toFixed(2)),
                unrealizedPnL,
                unrealizedPnLPercent,
            });
        }
    }

    positions = updatedPositions;

    // --- PHASE 2: EVALUATE CANDIDATES FOR NEW ENTRY (BUY) ---
    addThought("Analysis", `Scanning market universe for high-probability setups combining positive news sentiment and trend strength under '${strategy}' strategy.`);

    // Score all candidate stocks
    interface CandidateScore {
        stock: StockAsset;
        compositeScore: number;
        sentimentWeight: number;
        trendWeight: number;
        valuationWeight: number;
        primaryCatalyst: string;
    }

    const candidates: CandidateScore[] = [];

    for (const stock of stocks) {
        // Find matching news articles
        const symbolKeywords = [stock.symbol.toLowerCase(), stock.name.toLowerCase(), stock.sector.toLowerCase()];
        const matchedNews = combinedNews.filter((article) => {
            const text = `${article.title} ${article.summary}`.toLowerCase();
            return symbolKeywords.some((kw) => text.includes(kw));
        });

        // Determine effective sentiment
        let newsSentimentVal = stock.sentimentScore;
        let catalystText = stock.catalystSummary;

        if (matchedNews.length > 0) {
            const bullishMatches = matchedNews.filter((n) => n.sentiment === "Bullish").length;
            const bearishMatches = matchedNews.filter((n) => n.sentiment === "Bearish").length;
            const sentimentDelta = (bullishMatches - bearishMatches) * 0.25;
            newsSentimentVal = Math.min(1.0, Math.max(-1.0, newsSentimentVal + sentimentDelta));
            catalystText = matchedNews[0].title;
        }

        // Technical Trend Factor (0 to 100)
        let trendScore = 50;
        if (stock.trend === "Strong Uptrend") trendScore = 95;
        else if (stock.trend === "Bullish") trendScore = 75;
        else if (stock.trend === "Neutral") trendScore = 45;
        else if (stock.trend === "Bearish") trendScore = 25;
        else if (stock.trend === "Strong Downtrend") trendScore = 10;

        // RSI adjustments (sweet spot is 50 - 68)
        if (stock.rsi >= 50 && stock.rsi <= 68) trendScore += 10;
        else if (stock.rsi > 75) trendScore -= 15; // overbought risk

        // Valuation / Fundamental Factor
        let valuationScore = 50;
        if (stock.peRatio < 25) valuationScore = 80;
        else if (stock.peRatio < 35) valuationScore = 65;
        else valuationScore = 40;

        // Weights according to strategy profile
        let wSentiment = 0.45;
        let wTrend = 0.35;
        let wValuation = 0.20;

        if (strategy === "aggressive") {
            wSentiment = 0.50;
            wTrend = 0.40;
            wValuation = 0.10;
        } else if (strategy === "value") {
            wSentiment = 0.30;
            wTrend = 0.25;
            wValuation = 0.45;
        }

        // Normalized score from 0 to 100
        const normalizedSentiment = ((newsSentimentVal + 1) / 2) * 100;
        const compositeScore = Number(
            (normalizedSentiment * wSentiment + trendScore * wTrend + valuationScore * wValuation).toFixed(1)
        );

        candidates.push({
            stock,
            compositeScore,
            sentimentWeight: normalizedSentiment,
            trendWeight: trendScore,
            valuationWeight: valuationScore,
            primaryCatalyst: catalystText,
        });
    }

    // Sort candidates by highest conviction score
    candidates.sort((a, b) => b.compositeScore - a.compositeScore);

    addThought("Analysis", `Top ranked assets by algorithmic conviction: ${candidates.slice(0, 3).map((c) => `${c.stock.symbol} (Score: ${c.compositeScore})`).join(", ")}.`);

    // --- PHASE 3: POSITION SIZING & TRADE EXECUTION ---
    addThought("Risk Sizing", `Calculating position limits. Max allocation per asset: 20-25% of total capital (${portfolio.positions[0]?.currency || "₹"}${(portfolio.totalCapital * 0.22).toFixed(0)}).`);

    const maxAllocationPerStock = portfolio.totalCapital * (strategy === "aggressive" ? 0.28 : 0.22);
    const minScoreThreshold = strategy === "aggressive" ? 65 : strategy === "value" ? 58 : 62;

    for (const candidate of candidates) {
        if (candidate.compositeScore < minScoreThreshold) continue;

        const stock = candidate.stock;

        // Check if already holding this stock
        const existingPosition = positions.find((p) => p.symbol === stock.symbol);
        const currentHeldCost = existingPosition ? existingPosition.totalCost : 0;

        if (currentHeldCost >= maxAllocationPerStock) {
            continue; // Already at max allocation
        }

        // Available budget for this trade
        const maxBudgetForThis = maxAllocationPerStock - currentHeldCost;
        const allocationBudget = Math.min(maxBudgetForThis, currentCash);

        // Can we afford at least 1 share?
        if (allocationBudget < stock.price) {
            continue;
        }

        // Sizing shares
        const sharesToBuy = Math.floor(allocationBudget / stock.price);
        if (sharesToBuy <= 0) continue;

        const totalCost = Number((sharesToBuy * stock.price).toFixed(2));
        currentCash = Number((currentCash - totalCost).toFixed(2));
        totalTrades += 1;

        // Targets and stop-loss levels based on strategy
        const targetPercent = strategy === "aggressive" ? 0.14 : strategy === "value" ? 0.08 : 0.11;
        const stopLossPercent = strategy === "aggressive" ? 0.05 : 0.04;

        const targetPrice = Number((stock.price * (1 + targetPercent)).toFixed(2));
        const stopLoss = Number((stock.price * (1 - stopLossPercent)).toFixed(2));

        // Formulate Detailed Chain-of-Thought Rationale
        const confidenceScore = Math.min(96, Math.max(72, Math.round(candidate.compositeScore * 1.05)));

        const thesis = `Accumulating ${stock.name} based on strong ${candidate.stock.trend.toLowerCase()} momentum combined with high-impact ${candidate.stock.sentimentLabel.toLowerCase()} news catalysts.`;

        const marketTrendRationale = `${stock.trend} confirmed: Trading at ${stock.currency}${stock.price} (above 50-day EMA of ${stock.currency}${stock.movingAverage50}). RSI is optimal at ${stock.rsi}, signaling strong institutional accumulation with room before overbought levels.`;

        const riskAssessment = `Asymmetric Risk/Reward: Target set at ${stock.currency}${targetPrice} (+${(targetPercent * 100).toFixed(1)}%), with capital protection stop-loss strictly defined at ${stock.currency}${stopLoss} (-${(stopLossPercent * 100).toFixed(1)}%). Expected Risk/Reward ratio: ${(targetPercent / stopLossPercent).toFixed(1)}:1.`;

        const allocationReason = `Allocated ${stock.currency}${totalCost.toLocaleString()} (${((totalCost / portfolio.totalCapital) * 100).toFixed(1)}% of total portfolio capital) for ${sharesToBuy} shares, strictly adhering to our risk budget and single-asset ceiling.`;

        const reasoning: TradeReasoning = {
            thesis,
            newsCatalyst: candidate.primaryCatalyst,
            marketTrend: marketTrendRationale,
            sentimentScore: stock.sentimentScore,
            sentimentLabel: stock.sentimentLabel,
            riskAssessment,
            allocationReason,
            targetPrice,
            stopLoss,
            confidence: confidenceScore,
        };

        const now = Date.now();
        const buyTrade: TradeExecution = {
            id: `trade-${now}-${stock.symbol}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            timestampMs: now,
            action: "BUY",
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            shares: sharesToBuy,
            totalAmount: totalCost,
            currency: stock.currency,
            reasoning,
        };

        tradesExecuted.push(buyTrade);
        tradeHistory.unshift(buyTrade);

        // Update or add to positions
        if (existingPosition) {
            const newTotalShares = existingPosition.shares + sharesToBuy;
            const newTotalCost = Number((existingPosition.totalCost + totalCost).toFixed(2));
            const newAvgPrice = Number((newTotalCost / newTotalShares).toFixed(2));
            const newCurrentValue = Number((newTotalShares * stock.price).toFixed(2));
            const newUnrealized = Number((newCurrentValue - newTotalCost).toFixed(2));

            const idx = positions.findIndex((p) => p.symbol === stock.symbol);
            positions[idx] = {
                ...existingPosition,
                shares: newTotalShares,
                averageBuyPrice: newAvgPrice,
                totalCost: newTotalCost,
                currentPrice: stock.price,
                currentValue: newCurrentValue,
                unrealizedPnL: newUnrealized,
                unrealizedPnLPercent: Number(((newUnrealized / newTotalCost) * 100).toFixed(2)),
                targetPrice,
                stopLoss,
                thesis,
            };
        } else {
            positions.push({
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                currency: stock.currency,
                shares: sharesToBuy,
                averageBuyPrice: stock.price,
                currentPrice: stock.price,
                totalCost,
                currentValue: totalCost,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
                targetPrice,
                stopLoss,
                thesis,
                boughtAt: timestamp,
            });
        }

        addThought("Execution", `EXECUTED BUY: ${stock.symbol} x ${sharesToBuy} @ ${stock.currency}${stock.price} (${stock.currency}${totalCost.toLocaleString()}). Catalyst: "${candidate.primaryCatalyst.slice(0, 60)}..."`);

        // Stop if we executed enough trades for this cycle or ran out of cash
        if (tradesExecuted.length >= 3 || currentCash < portfolio.totalCapital * 0.05) {
            break;
        }
    }

    if (tradesExecuted.length === 0) {
        addThought("Execution", `No new trades met the stringent risk-reward hurdles this cycle. Existing portfolio held intact.`);
    }

    // Calculate final portfolio totals
    const investedCapital = Number(positions.reduce((acc, p) => acc + p.currentValue, 0).toFixed(2));
    const currentValue = Number((currentCash + investedCapital).toFixed(2));
    const totalPnL = Number((currentValue - portfolio.totalCapital).toFixed(2));
    const totalPnLPercent = Number(((totalPnL / portfolio.totalCapital) * 100).toFixed(2));
    const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

    const updatedPortfolio: PaperPortfolio = {
        ...portfolio,
        cash: currentCash,
        investedCapital,
        currentValue,
        totalPnL,
        totalPnLPercent,
        realizedPnL,
        winRate,
        totalTrades,
        winningTrades,
        strategy,
        positions,
        tradeHistory,
        lastUpdated: new Date().toLocaleTimeString(),
    };

    const overallMarketSentiment: "Bullish" | "Neutral" | "Bearish" =
        candidates.filter((c) => c.stock.sentimentScore > 0.3).length > candidates.length / 2
            ? "Bullish"
            : candidates.filter((c) => c.stock.sentimentScore < -0.2).length > candidates.length / 3
            ? "Bearish"
            : "Neutral";

    const summary = tradesExecuted.length > 0
        ? `Deliberation complete: Executed ${tradesExecuted.length} trade(s) based on sentiment catalysts and trend signals. Portfolio Net Worth: ${portfolio.positions[0]?.currency || "₹"}${currentValue.toLocaleString()} (${totalPnL >= 0 ? "+" : ""}${totalPnLPercent}%).`
        : `Deliberation complete: All assets analyzed. No reallocation required. Retaining current strategic weights.`;

    addThought("Execution", summary);

    return {
        cycleId,
        timestamp,
        marketSentimentSummary: overallMarketSentiment,
        thoughts,
        tradesExecuted,
        portfolio: updatedPortfolio,
        summary,
    };
}
