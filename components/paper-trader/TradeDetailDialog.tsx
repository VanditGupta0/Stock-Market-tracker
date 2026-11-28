'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Bot,
    Newspaper,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Layers,
    ExternalLink,
} from 'lucide-react';
import type { SerializedTrade } from '@/lib/actions/paperTrader.actions';

export default function TradeDetailDialog({
    trade,
    open,
    onClose,
}: {
    trade: SerializedTrade | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!trade) return null;

    const isBuy = trade.action === 'BUY';
    const isProfit = trade.profit > 0;
    // Trades from the old AI trader have a confidence score. Manual orders and rule exits have 0.
    const isAiTrade = trade.confidenceScore > 0;
    const dateFormatted = new Date(trade.executedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
    });

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-600 text-gray-300 max-h-[90vh] overflow-y-auto scrollbar-hide-default">
                <DialogHeader className="border-b border-gray-700 pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                    isBuy
                                        ? 'bg-teal-400/15 text-teal-400 border border-teal-400/30'
                                        : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30'
                                }`}
                            >
                                {isBuy ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4" />
                                )}
                                {trade.action}
                            </span>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                                    {trade.symbol}
                                    <span className="text-sm font-normal text-gray-400">
                                        • {trade.company}
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                    Executed on {dateFormatted} (IST)
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Profit badge for sells */}
                        {!isBuy && trade.profit !== 0 && (
                            <div className="text-right">
                                <span
                                    className={`text-lg font-bold block ${
                                        isProfit ? 'text-teal-400' : 'text-red-500'
                                    }`}
                                >
                                    {isProfit ? '+' : ''}₹
                                    {trade.profit.toLocaleString('en-IN', {
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                                <span
                                    className={`text-xs font-semibold ${
                                        isProfit ? 'text-teal-400/90' : 'text-red-400'
                                    }`}
                                >
                                    {isProfit ? '+' : ''}
                                    {trade.profitPercent.toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* Execution Metrics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-900/80 rounded-xl border border-gray-700/80 text-xs">
                        <div>
                            <span className="text-gray-500 block mb-0.5">Execution Price</span>
                            <span className="text-gray-100 font-bold text-sm">
                                ₹{trade.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-0.5">Shares Traded</span>
                            <span className="text-gray-100 font-bold text-sm">{trade.shares}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-0.5">Total Amount</span>
                            <span className="text-gray-100 font-bold text-sm">
                                ₹{trade.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-0.5">
                                {isAiTrade ? 'Strategy / Risk-Reward' : 'Order type'}
                            </span>
                            <span className="text-yellow-500 font-semibold text-sm">
                                {isAiTrade ? `${trade.riskReward} R:R` : trade.strategy}
                            </span>
                        </div>
                    </div>

                    {/* SECTION 1: Rationale (AI trades) or order notes (manual orders and rule exits) */}
                    <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-transparent p-4">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                                {isAiTrade ? <Bot className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                                <span>{isAiTrade ? 'AI Thought Process & Rationale' : 'Order details'}</span>
                            </div>
                            {isAiTrade && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {trade.confidenceScore}% Confidence Score
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">
                            {trade.thoughtProcess}
                        </p>
                    </div>

                    {/* SECTION 2: Catalyzing News (AI trades only) */}
                    {isAiTrade && (
                    <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                                <Newspaper className="h-4 w-4" />
                                <span>Catalyzing News Behind This Move</span>
                            </div>
                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    trade.newsCatalyst.sentiment === 'VERY_BULLISH' ||
                                    trade.newsCatalyst.sentiment === 'BULLISH'
                                        ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                                        : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                }`}
                            >
                                {trade.newsCatalyst.sentiment} • Impact: {trade.newsCatalyst.impactScore}/100
                            </span>
                        </div>

                        <div className="border-l-2 border-yellow-500/70 pl-3 my-2">
                            <h4 className="font-semibold text-gray-100 text-sm mb-1 leading-snug">
                                &ldquo;{trade.newsCatalyst.headline}&rdquo;
                            </h4>
                            <span className="text-xs text-gray-500 block">
                                Source: {trade.newsCatalyst.source}
                            </span>
                        </div>

                        {trade.newsCatalyst.summary && (
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                {trade.newsCatalyst.summary}
                            </p>
                        )}

                        {trade.newsCatalyst.url && (
                            <a
                                href={trade.newsCatalyst.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 mt-3 font-medium transition-colors"
                            >
                                <span>Read original news source</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>

                    )}

                    {/* SECTION 3: Current Market Trend & Setup (AI trades only) */}
                    {isAiTrade && (
                    <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm mb-3">
                            <TrendingUp className="h-4 w-4" />
                            <span>Technical Market Trend & Indicators</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/60">
                                <span className="text-gray-500 block mb-1">Identified Pattern</span>
                                <span className="font-semibold text-gray-100">
                                    {trade.marketTrend.trendName}
                                </span>
                            </div>
                            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/60">
                                <span className="text-gray-500 block mb-1">Support / Resistance Target</span>
                                <span className="font-semibold text-gray-100">
                                    {trade.marketTrend.supportResistance || 'Support established at moving average'}
                                </span>
                            </div>
                            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/60">
                                <span className="text-gray-500 block mb-1">Volume Profile</span>
                                <span className="font-semibold text-gray-100">
                                    {trade.marketTrend.volumeProfile}
                                </span>
                            </div>
                            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/60">
                                <span className="text-gray-500 block mb-1">Timeframe Horizon</span>
                                <span className="font-semibold text-gray-100">
                                    {trade.marketTrend.timeframe}
                                </span>
                            </div>
                        </div>

                        {/* Indicators tags */}
                        {trade.marketTrend.indicators?.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1">
                                    <Layers className="h-3 w-3" /> Confirming Indicators:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {trade.marketTrend.indicators.map((ind, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-md bg-gray-800 text-teal-400 text-xs border border-teal-400/20 font-mono"
                                        >
                                            {ind}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
