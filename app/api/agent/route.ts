import { NextResponse } from "next/server";
import { getStockUniverse, PRESET_BREAKING_NEWS } from "@/lib/agent/marketUniverse";
import { runAgentTradingCycle } from "@/lib/agent/reasoningEngine";
import { createInitialPortfolio } from "@/lib/agent/portfolioStore";
import { MARKET_NEWS } from "@/lib/constants";
import { PaperPortfolio, StrategyProfile } from "@/lib/agent/types";

export async function GET() {
    try {
        const stocks = getStockUniverse();
        const news = MARKET_NEWS;
        const defaultPortfolio = createInitialPortfolio(100000, "balanced");

        return NextResponse.json({
            success: true,
            stocks,
            news,
            presetBreakingNews: PRESET_BREAKING_NEWS,
            defaultPortfolio,
        });
    } catch (error) {
        console.error("Agent API GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch market data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            portfolio,
            strategy = "balanced",
            customNewsHeadline,
            initialCapital,
        } = body as {
            portfolio?: PaperPortfolio;
            strategy?: StrategyProfile;
            customNewsHeadline?: string;
            initialCapital?: number;
        };

        const activePortfolio = portfolio || createInitialPortfolio(initialCapital || 100000, strategy);
        const stocks = getStockUniverse();
        const news = MARKET_NEWS;

        const result = runAgentTradingCycle({
            portfolio: activePortfolio,
            stocks,
            newsArticles: news,
            strategy,
            customNewsHeadline,
        });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Agent API POST error:", error);
        return NextResponse.json({ success: false, error: "Failed to run agent trading cycle" }, { status: 500 });
    }
}
