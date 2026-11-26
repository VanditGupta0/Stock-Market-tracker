'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Target, ShieldAlert, ArrowUpRight } from 'lucide-react';
import type { SerializedPosition } from '@/lib/actions/paperTrader.actions';

export default function PositionCard({ position }: { position: SerializedPosition }) {
    const isProfit = position.unrealizedProfit >= 0;

    return (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-5 hover:border-gray-500 transition-colors flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <Link
                        href={`/stocks/${position.symbol}`}
                        className="group flex items-center gap-3 flex-1 min-w-0"
                    >
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                isProfit ? 'bg-teal-400/10 text-teal-400' : 'bg-red-500/10 text-red-500'
                            }`}
                        >
                            {isProfit ? (
                                <TrendingUp className="h-5 w-5" />
                            ) : (
                                <TrendingDown className="h-5 w-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-100 text-lg group-hover:text-yellow-400 transition-colors flex items-center gap-1.5 truncate">
                                {position.symbol}
                                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400" />
                            </h3>
                            <p className="text-xs text-gray-400 truncate">{position.company}</p>
                        </div>
                    </Link>

                    <div className="text-right">
                        <span
                            className={`text-base font-bold flex items-center justify-end gap-0.5 ${
                                isProfit ? 'text-teal-400' : 'text-red-500'
                            }`}
                        >
                            {isProfit ? '+' : ''}₹
                            {position.unrealizedProfit.toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                            })}
                        </span>
                        <span
                            className={`text-xs font-semibold ${
                                isProfit ? 'text-teal-400/90' : 'text-red-400'
                            }`}
                        >
                            {isProfit ? '+' : ''}
                            {position.unrealizedProfitPercent.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-900/60 rounded-lg border border-gray-700/60 my-3 text-xs">
                    <div>
                        <span className="text-gray-500 block">Shares</span>
                        <span className="text-gray-200 font-semibold">{position.shares}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Avg Buy Price</span>
                        <span className="text-gray-200 font-semibold">
                            ₹{position.avgBuyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Current Price</span>
                        <span className="text-gray-100 font-bold">
                            ₹{position.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                        {/* Server and browser time zones can differ, so the formatted time may not match on hydration */}
                        <span className="text-[10px] text-gray-500 block" suppressHydrationWarning>
                            {position.priceUpdatedAt
                                ? `Live price as of ${new Date(position.priceUpdatedAt).toLocaleString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                  })}`
                                : 'Not a live price yet. Scan to update.'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Market Value</span>
                        <span className="text-gray-100 font-bold">
                            ₹{position.marketValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Target & Stop Loss */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <div className="flex items-center gap-1 text-teal-400">
                        <Target className="h-3.5 w-3.5" />
                        <span>
                            Target: ₹
                            {position.targetPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>
                            Stop: ₹
                            {position.stopLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* View Details Link */}
            <div className="mt-4 pt-3 border-t border-gray-700/60">
                <Link
                    href={`/stocks/${position.symbol}`}
                    className="text-xs text-yellow-500 hover:text-yellow-400 font-medium transition-colors flex items-center justify-between"
                >
                    <span>View Live Chart & Technicals</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}
