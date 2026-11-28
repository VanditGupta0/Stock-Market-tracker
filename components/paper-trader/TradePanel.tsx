'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SerializedPaperAccount } from '@/lib/actions/paperTrader.actions';
import { PAPER_TRADER_UNIVERSE } from '@/lib/paper-trader/universe';

type Side = 'BUY' | 'SELL';
type Quote = { price: number; asOf: string; changePercent: number | null; sourceLabel: string };

const inr = (n: number, digits = 2) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: digits })}`;
const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

/** Place buy and sell orders yourself, at the live market price. */
export default function TradePanel({
    account,
    onTraded,
}: {
    account: SerializedPaperAccount;
    onTraded: () => void | Promise<void>;
}) {
    const [side, setSide] = useState<Side>('BUY');
    const [chosenSymbol, setSymbol] = useState(PAPER_TRADER_UNIVERSE[0].symbol);
    const [sharesInput, setSharesInput] = useState('');
    const [quoteResult, setQuoteResult] = useState<{ key: string; quote: Quote | null; error: string } | null>(null);
    const [quoteNonce, setQuoteNonce] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

    const { cash, positions } = account;

    const options = useMemo(
        () =>
            side === 'BUY'
                ? PAPER_TRADER_UNIVERSE.map((s) => ({ symbol: s.symbol, label: `${s.symbol} · ${s.name}` }))
                : positions.map((p) => ({
                      symbol: p.symbol,
                      label: `${p.symbol} · ${p.shares} share${p.shares === 1 ? '' : 's'} held`,
                  })),
        [side, positions]
    );

    // The stock actually in use: the chosen one if it is still valid for Buy/Sell, otherwise the first option.
    const symbol = options.some((o) => o.symbol === chosenSymbol) ? chosenSymbol : (options[0]?.symbol ?? '');

    // Load the live price for the selected stock (reloads when the stock changes or the user refreshes).
    const requestKey = symbol ? `${symbol}|${quoteNonce}` : '';
    useEffect(() => {
        if (!requestKey) return;
        let cancelled = false;
        fetch(`/api/paper-trader/quote?symbol=${encodeURIComponent(symbol)}`)
            .then(async (res) => {
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok) setQuoteResult({ key: requestKey, quote: null, error: data.error ?? 'Could not load the price.' });
                else setQuoteResult({ key: requestKey, quote: data, error: '' });
            })
            .catch(() => {
                if (!cancelled) setQuoteResult({ key: requestKey, quote: null, error: 'Network error. Could not load the price.' });
            });
        return () => {
            cancelled = true;
        };
    }, [requestKey, symbol]);

    const currentResult = quoteResult?.key === requestKey ? quoteResult : null;
    const quote = currentResult?.quote ?? null;
    const quoteError = currentResult?.error ?? '';
    const quoteLoading = !!requestKey && !currentResult;

    const held = positions.find((p) => p.symbol === symbol);
    const shares = Number(sharesInput);
    const sharesValid = Number.isInteger(shares) && shares >= 1;
    const price = quote?.price ?? 0;
    const total = sharesValid && price > 0 ? shares * price : 0;
    const maxShares = side === 'BUY' ? (price > 0 ? Math.floor(cash / price) : 0) : (held?.shares ?? 0);

    let problem = '';
    if (sharesValid && price > 0) {
        if (side === 'BUY' && total > cash) problem = `Not enough cash. You have ${inr(cash, 0)}.`;
        if (side === 'SELL' && shares > (held?.shares ?? 0)) problem = `You only hold ${held?.shares ?? 0} shares.`;
    }

    const estPnl = side === 'SELL' && held && sharesValid && price > 0 ? (price - held.avgBuyPrice) * shares : null;
    const canSubmit = !!symbol && sharesValid && price > 0 && !problem && !submitting && !quoteLoading;

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/paper-trader/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, action: side, shares }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ text: data.error ?? 'Could not place the order.', ok: false });
            } else {
                setMessage({ text: data.message, ok: true });
                setSharesInput('');
                await onTraded();
                setQuoteNonce((n) => n + 1);
            }
        } catch {
            setMessage({ text: 'Network error. Please try again.', ok: false });
        } finally {
            setSubmitting(false);
        }
    }, [symbol, side, shares, onTraded]);

    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex flex-col gap-4">
            <div>
                <h2 className="text-base font-semibold text-gray-100">Place an order</h2>
                <p className="text-xs text-gray-500 mt-0.5">You decide every trade. Orders fill at the live price.</p>
            </div>

            {/* Buy / Sell */}
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Order type">
                <button
                    type="button"
                    aria-pressed={side === 'BUY'}
                    onClick={() => {
                        setSide('BUY');
                        setMessage(null);
                    }}
                    className={`h-10 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                        side === 'BUY'
                            ? 'bg-teal-400/15 text-teal-400 border-teal-400/40'
                            : 'bg-gray-800 text-gray-500 border-gray-600 hover:text-gray-300'
                    }`}
                >
                    <ArrowUpRight className="h-4 w-4" /> Buy
                </button>
                <button
                    type="button"
                    aria-pressed={side === 'SELL'}
                    onClick={() => {
                        setSide('SELL');
                        setMessage(null);
                    }}
                    className={`h-10 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                        side === 'SELL'
                            ? 'bg-yellow-500/15 text-yellow-500 border-yellow-500/40'
                            : 'bg-gray-800 text-gray-500 border-gray-600 hover:text-gray-300'
                    }`}
                >
                    <ArrowDownRight className="h-4 w-4" /> Sell
                </button>
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="trade-stock" className="text-xs text-gray-400">
                    Stock
                </label>
                {options.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">You don&apos;t hold any stocks to sell yet.</p>
                ) : (
                    <select
                        id="trade-stock"
                        value={symbol}
                        onChange={(e) => {
                            setSymbol(e.target.value);
                            setMessage(null);
                        }}
                        className="h-12 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 text-base text-white focus:border-yellow-500 focus:outline-none"
                    >
                        {options.map((o) => (
                            <option key={o.symbol} value={o.symbol}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Live price */}
            {options.length > 0 && (
                <div className="rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2.5 min-h-[64px]" aria-live="polite">
                    {quoteLoading && !quote ? (
                        <span className="text-sm text-gray-500">Loading live price…</span>
                    ) : quoteError ? (
                        <span className="text-sm text-red-400">{quoteError}</span>
                    ) : quote ? (
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-xs text-gray-500 block">Live price</span>
                                <span className="text-lg font-bold text-gray-100">{inr(quote.price)}</span>
                                {quote.changePercent !== null && (
                                    <span
                                        className={`ml-2 text-xs font-medium ${
                                            quote.changePercent >= 0 ? 'text-teal-400' : 'text-red-500'
                                        }`}
                                    >
                                        {quote.changePercent >= 0 ? '+' : ''}
                                        {quote.changePercent.toFixed(2)}% today
                                    </span>
                                )}
                                <span className="text-[11px] text-gray-500 block mt-0.5">
                                    Last traded {formatTime(quote.asOf)} IST · {quote.sourceLabel}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuoteNonce((n) => n + 1)}
                                aria-label="Refresh price"
                                className="p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-gray-700 cursor-pointer"
                            >
                                <RefreshCw className={`h-4 w-4 ${quoteLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Shares */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label htmlFor="trade-shares" className="text-xs text-gray-400">
                        Shares
                    </label>
                    <button
                        type="button"
                        disabled={maxShares < 1}
                        onClick={() => setSharesInput(String(maxShares))}
                        className="text-xs text-yellow-500 hover:text-yellow-400 disabled:text-gray-600 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Max: {maxShares.toLocaleString('en-IN')}
                    </button>
                </div>
                <Input
                    id="trade-shares"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={sharesInput}
                    onChange={(e) => {
                        setSharesInput(e.target.value);
                        setMessage(null);
                    }}
                    placeholder="e.g. 5"
                    disabled={options.length === 0}
                    className="form-input"
                />
            </div>

            {/* Order summary */}
            {total > 0 && (
                <div className="text-sm flex flex-col gap-1.5 border-t border-gray-700 pt-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">{side === 'BUY' ? 'Estimated cost' : 'Estimated proceeds'}</span>
                        <span className="text-gray-100 font-semibold">{inr(total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Cash after</span>
                        <span className="text-gray-300">{inr(side === 'BUY' ? cash - total : cash + total, 0)}</span>
                    </div>
                    {estPnl !== null && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Profit / loss on these shares</span>
                            <span className={`font-semibold ${estPnl >= 0 ? 'text-teal-400' : 'text-red-500'}`}>
                                {estPnl >= 0 ? '+' : '-'}
                                {inr(Math.abs(estPnl))}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {problem && <p className="text-xs text-red-400">{problem}</p>}

            <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={side === 'BUY' ? 'yellow-btn w-full' : 'h-12 w-full rounded-lg bg-gray-700 hover:bg-gray-600 text-yellow-500 font-medium text-base border border-yellow-500/40 disabled:opacity-50 cursor-pointer'}
            >
                {submitting
                    ? 'Placing order…'
                    : sharesValid && symbol
                      ? `${side === 'BUY' ? 'Buy' : 'Sell'} ${shares} × ${symbol}`
                      : side === 'BUY'
                        ? 'Buy'
                        : 'Sell'}
            </Button>

            {message && (
                <p className={`text-xs leading-relaxed ${message.ok ? 'text-teal-400' : 'text-red-400'}`} role="status">
                    {message.text}
                </p>
            )}
            <p className="text-[11px] text-gray-500 leading-relaxed">
                The price is checked again when you confirm, so the fill can differ slightly from what you see here.
            </p>
        </div>
    );
}
