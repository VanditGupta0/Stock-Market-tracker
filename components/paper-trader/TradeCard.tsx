'use client';

import { Newspaper, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { SerializedTrade } from '@/lib/actions/paperTrader.actions';
import { formatTimeAgo } from '@/lib/utils';

export default function TradeCard({
    trade,
    onClick,
}: {
    trade: SerializedTrade;
    onClick: () => void;
}) {
    const isBuy = trade.action === 'BUY';
    const isProfit = trade.profit > 0;
    // Trades from the old AI trader have a confidence score. Manual orders and rule exits have 0.
    const isAiTrade = trade.confidenceScore > 0;
    const timeAgo = formatTimeAgo(Math.floor(new Date(trade.executedAt).getTime() / 1000));

    return (
        <div
            onClick={onClick}
            className="group relative bg-gray-800 border border-gray-600 hover:border-yellow-500/60 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
        >
            <div>
                {/* Header: Action Badge, Symbol, Profit */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                        <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                                isBuy
                                    ? 'bg-teal-400/10 text-teal-400 border border-teal-400/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}
                        >
                            {isBuy ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            {trade.action}
                        </span>
                        <div>
                            <h3 className="font-bold text-gray-100 text-lg group-hover:text-yellow-400 transition-colors">
                                {trade.symbol}
                            </h3>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">
                                {trade.company}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        {!isBuy && trade.profit !== 0 ? (
                            <div className="flex flex-col items-end">
                                <span
                                    className={`text-base font-bold flex items-center gap-0.5 ${
                                        isProfit ? 'text-teal-400' : 'text-red-500'
                                    }`}
                                >
                                    {isProfit ? '+' : ''}₹
                                    {trade.profit.toLocaleString('en-IN', {
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                                <span
                                    className={`text-xs font-medium ${
                                        isProfit ? 'text-teal-400/90' : 'text-red-400'
                                    }`}
                                >
                                    {isProfit ? '+' : ''}
                                    {trade.profitPercent.toFixed(2)}%
                                </span>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400">
                                <span>{trade.shares} shares</span>
                                <p className="text-gray-300 font-semibold text-sm">
                                    @ ₹{trade.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Strategy & Trend Badge */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-700/70 text-gray-300 border border-gray-600/50">
                        {trade.strategy}
                    </span>
                    {isAiTrade && (
                        <>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-600/15 text-blue-400 border border-blue-600/30">
                                {trade.marketTrend.trendName}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 ml-auto">
                                {trade.confidenceScore}% Conviction
                            </span>
                        </>
                    )}
                </div>

                {/* News Catalyst Snippet */}
                {isAiTrade && trade.newsCatalyst?.headline && (
                    <div className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-700/60 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium mb-1">
                            <Newspaper className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{trade.newsCatalyst.source}</span>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                            &ldquo;{trade.newsCatalyst.headline}&rdquo;
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Footer */}
            <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
                <span>{timeAgo}</span>
                <span className="text-yellow-500 font-medium group-hover:translate-x-0.5 transition-transform">
                    View details →
                </span>
            </div>
        </div>
    );
}
