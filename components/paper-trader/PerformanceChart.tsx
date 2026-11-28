'use client';

import { useEffect, useMemo, useState } from 'react';
import { LineChart } from 'lucide-react';
import { getPerformanceHistory, type PerformancePoint } from '@/lib/actions/paperTraderRisk.actions';

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const shortDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * Portfolio value after each trade or refresh, against the total money put in.
 * Deposits are taken out of the line: each point is shifted up by the funds added after it, so adding
 * money never looks like a gain. Points saved before deposits were tracked are left as they are.
 * `refreshKey` should change whenever the account changes (e.g. lastScanAt) so the chart reloads.
 */
export default function PerformanceChart({
    budget,
    refreshKey,
}: {
    budget: number;
    refreshKey: string;
}) {
    const [rawPoints, setPoints] = useState<PerformancePoint[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [hover, setHover] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        getPerformanceHistory()
            .then((data) => {
                if (!cancelled) setPoints(data);
            })
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    const points = useMemo(
        () => rawPoints.map((p) => ({ ...p, portfolioValue: p.portfolioValue + (budget - (p.budget ?? budget)) })),
        [rawPoints, budget]
    );

    const stats = useMemo(() => {
        if (points.length < 2) return null;
        const values = points.map((p) => p.portfolioValue);
        const last = values[values.length - 1];
        let peak = values[0];
        let maxDrawdown = 0;
        for (const v of values) {
            peak = Math.max(peak, v);
            if (peak > 0) maxDrawdown = Math.max(maxDrawdown, ((peak - v) / peak) * 100);
        }
        return {
            returnPct: budget > 0 ? ((last - budget) / budget) * 100 : 0,
            best: Math.max(...values),
            maxDrawdown,
        };
    }, [points, budget]);

    const chart = useMemo(() => {
        if (points.length < 2) return null;
        const values = points.map((p) => p.portfolioValue);
        const lo = Math.min(...values, budget);
        const hi = Math.max(...values, budget);
        const pad = Math.max((hi - lo) * 0.15, hi * 0.002, 1);
        const min = lo - pad;
        const max = hi + pad;

        const W = 1000;
        const H = 240;
        const x = (i: number) => (i / (points.length - 1)) * W;
        const y = (v: number) => H - ((v - min) / (max - min)) * H;

        const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.portfolioValue).toFixed(1)}`).join(' ');
        const area = `${line} L${W},${H} L0,${H} Z`;
        return { W, H, x, y, line, area, baselineY: y(budget), min, max };
    }, [points, budget]);

    const last = points.length ? points[points.length - 1].portfolioValue : budget;
    const up = last >= budget;
    const color = up ? '#2dd4bf' : '#ef4444'; // teal-400 / red-500, matching the rest of the app
    const hovered = hover !== null ? points[hover] : null;

    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-base font-semibold text-gray-100">Portfolio performance</h2>
                </div>
                <span className="text-xs text-gray-500">
                    {hovered ? `${shortDate(hovered.at)} · ${inr(hovered.portfolioValue)}` : 'Value after each trade or refresh'}
                </span>
            </div>

            {!chart ? (
                <div className="h-60 flex items-center justify-center text-sm text-gray-500 text-center px-6">
                    {loaded
                        ? 'Place an order or refresh prices to start your chart. It needs at least two points to draw a line.'
                        : 'Loading…'}
                </div>
            ) : (
                <div
                    className="relative h-60 w-full"
                    onMouseLeave={() => setHover(null)}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = (e.clientX - rect.left) / rect.width;
                        const idx = Math.round(ratio * (points.length - 1));
                        setHover(Math.min(points.length - 1, Math.max(0, idx)));
                    }}
                >
                    <svg
                        viewBox={`0 0 ${chart.W} ${chart.H}`}
                        preserveAspectRatio="none"
                        className="absolute inset-0 h-full w-full"
                        role="img"
                        aria-label={`Portfolio value over time, currently ${inr(last)} against total funds of ${inr(budget)}`}
                    >
                        <defs>
                            <linearGradient id="perf-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <line
                            x1="0"
                            x2={chart.W}
                            y1={chart.baselineY}
                            y2={chart.baselineY}
                            stroke="#6b7280"
                            strokeWidth="1"
                            strokeDasharray="6 6"
                            vectorEffect="non-scaling-stroke"
                        />
                        <path d={chart.area} fill="url(#perf-fill)" />
                        <path d={chart.line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>

                    <span className="absolute left-1 text-[11px] text-gray-500" style={{ top: `calc(${(chart.baselineY / chart.H) * 100}% - 16px)` }}>
                        Total funded {inr(budget)}
                    </span>

                    {hover !== null && hovered && (
                        <div
                            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-800 pointer-events-none"
                            style={{
                                left: `${(chart.x(hover) / chart.W) * 100}%`,
                                top: `${(chart.y(hovered.portfolioValue) / chart.H) * 100}%`,
                                backgroundColor: color,
                            }}
                        />
                    )}
                </div>
            )}

            {stats && (
                <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                    <div>
                        <span className="text-gray-500 block">Return</span>
                        <span className={`font-semibold ${stats.returnPct >= 0 ? 'text-teal-400' : 'text-red-500'}`}>
                            {stats.returnPct >= 0 ? '+' : ''}
                            {stats.returnPct.toFixed(2)}%
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Best value</span>
                        <span className="font-semibold text-gray-200">{inr(stats.best)}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Biggest drop from a peak</span>
                        <span className="font-semibold text-gray-200">{stats.maxDrawdown.toFixed(2)}%</span>
                    </div>
                </div>
            )}
        </div>
    );
}
