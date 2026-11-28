'use client';

import { useState, useCallback } from 'react';
import {
    Wallet,
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    RefreshCw,
    Trophy,
    Target,
    PieChart,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SerializedPaperAccount } from '@/lib/actions/paperTrader.actions';
import {
    createPaperTraderAccount,
    resetPaperTraderAccount,
    getPaperTraderAccount,
} from '@/lib/actions/paperTrader.actions';
import { clearPerformanceHistory } from '@/lib/actions/paperTraderRisk.actions';
import TradeCard from '@/components/paper-trader/TradeCard';
import PositionCard from '@/components/paper-trader/PositionCard';
import TradeDetailDialog from '@/components/paper-trader/TradeDetailDialog';
import PerformanceChart from '@/components/paper-trader/PerformanceChart';
import RiskRulesPanel from '@/components/paper-trader/RiskRulesPanel';
import TradePanel from '@/components/paper-trader/TradePanel';

type Tab = 'trades' | 'positions';

const PaperTraderClient = ({
    initialAccount,
}: {
    initialAccount: SerializedPaperAccount | null;
}) => {
    const [account, setAccount] = useState(initialAccount);
    const [budgetInput, setBudgetInput] = useState('100000');
    const [creating, setCreating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('trades');
    const [statusMessage, setStatusMessage] = useState('');

    // ---- Create account ----
    const handleCreate = useCallback(async () => {
        const budget = parseFloat(budgetInput);
        if (isNaN(budget) || budget < 1000) return;
        setCreating(true);
        try {
            const result = await createPaperTraderAccount(budget);
            if (result) setAccount(result);
        } finally {
            setCreating(false);
        }
    }, [budgetInput]);

    // ---- Reload account (after a trade, or after risk rules change open positions) ----
    const refreshAccount = useCallback(async () => {
        const refreshed = await getPaperTraderAccount();
        if (refreshed) setAccount(refreshed);
    }, []);

    // ---- Refresh prices: revalue positions at live prices and apply stop-loss / take-profit rules ----
    const handleRefreshPrices = useCallback(async () => {
        setRefreshing(true);
        setStatusMessage('');
        try {
            const res = await fetch('/api/paper-trader/scan', { method: 'POST' });
            const data = await res.json();
            setStatusMessage(data.error ?? data.message ?? 'Prices updated.');
            await refreshAccount();
        } catch {
            setStatusMessage('Network error. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }, [refreshAccount]);

    // ---- Reset account ----
    const handleReset = useCallback(async () => {
        if (!confirm('Reset your paper trading account? All trades and positions will be lost.'))
            return;
        setResetting(true);
        try {
            const result = await resetPaperTraderAccount();
            if (result) {
                await clearPerformanceHistory();
                setAccount(result);
                setStatusMessage('');
                setSelectedTradeId(null);
            }
        } finally {
            setResetting(false);
        }
    }, []);

    const selectedTrade =
        account?.trades.find((t) => t.tradeId === selectedTradeId) ?? null;

    // ---- Onboarding: no account yet ----
    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-yellow-500" />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">
                        Start Paper Trading
                    </h2>
                    <p className="text-gray-500 text-base mb-6">
                        Assign a budget and trade Indian stocks yourself at live market
                        prices. You choose every trade. No real money involved.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full max-w-sm">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            ₹
                        </span>
                        <Input
                            type="number"
                            min={1000}
                            step={1000}
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="100000"
                            className="form-input pl-7"
                        />
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={creating}
                        className="yellow-btn px-6 shrink-0"
                    >
                        {creating ? 'Creating…' : 'Start Trading'}
                    </Button>
                </div>
                <p className="text-xs text-gray-500">Minimum ₹1,000</p>
            </div>
        );
    }

    // ---- Main dashboard ----
    const {
        budget,
        cash,
        portfolioValue,
        totalProfit,
        totalProfitPercent,
        realizedProfit,
        unrealizedProfit,
        totalTrades,
        winRate,
        positions,
        trades,
    } = account;

    const isProfitable = totalProfit >= 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<PieChart className="h-5 w-5 text-yellow-500" />}
                    label="Portfolio Value"
                    value={`₹${portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    sub={`Budget: ₹${budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />
                <StatCard
                    icon={
                        isProfitable ? (
                            <TrendingUp className="h-5 w-5 text-teal-400" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        )
                    }
                    label="Total P&L"
                    value={`${isProfitable ? '+' : ''}₹${totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    valueColor={isProfitable ? 'text-teal-400' : 'text-red-500'}
                    sub={`${totalProfitPercent >= 0 ? '+' : ''}${totalProfitPercent.toFixed(2)}%`}
                />
                <StatCard
                    icon={<DollarSign className="h-5 w-5 text-yellow-500" />}
                    label="Available Cash"
                    value={`₹${cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    sub={`Realized: ${realizedProfit >= 0 ? '+' : ''}₹${realizedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />
                <StatCard
                    icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    label="Win Rate"
                    value={`${winRate.toFixed(0)}%`}
                    sub={`${totalTrades} total trades`}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={handleRefreshPrices}
                    disabled={refreshing}
                    className="yellow-btn px-5 gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Updating prices…' : 'Refresh Prices'}
                </Button>
                <Button
                    onClick={handleReset}
                    disabled={resetting}
                    variant="outline"
                    className="gap-2 text-gray-400 border-gray-600 hover:text-gray-100 hover:border-gray-500"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset Account
                </Button>
                {statusMessage && (
                    <span className="text-sm text-gray-400 ml-2">{statusMessage}</span>
                )}
            </div>

            {/* Unrealized P&L bar */}
            {positions.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Unrealized P&L:</span>
                    <span
                        className={`text-sm font-semibold ${
                            unrealizedProfit >= 0 ? 'text-teal-400' : 'text-red-500'
                        }`}
                    >
                        {unrealizedProfit >= 0 ? '+' : ''}₹
                        {unrealizedProfit.toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                        })}
                    </span>
                    <span className="text-xs text-gray-500">
                        across {positions.length} position{positions.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {/* Order form, performance chart and stop-loss / take-profit rules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <PerformanceChart budget={budget} refreshKey={account.lastScanAt} />
                    <RiskRulesPanel onSaved={refreshAccount} />
                </div>
                <TradePanel account={account} onTraded={refreshAccount} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-700">
                <TabButton
                    active={activeTab === 'trades'}
                    onClick={() => setActiveTab('trades')}
                    label={`Trades (${trades.length})`}
                />
                <TabButton
                    active={activeTab === 'positions'}
                    onClick={() => setActiveTab('positions')}
                    label={`Open Positions (${positions.length})`}
                />
            </div>

            {/* Content */}
            {activeTab === 'trades' && (
                <>
                    {trades.length === 0 ? (
                        <EmptyState
                            icon={<Target className="h-12 w-12 text-gray-500" />}
                            title="No trades yet"
                            description="Use 'Place an order' to buy your first stock at the live price."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {trades.map((trade) => (
                                <TradeCard
                                    key={trade.tradeId}
                                    trade={trade}
                                    onClick={() => setSelectedTradeId(trade.tradeId)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'positions' && (
                <>
                    {positions.length === 0 ? (
                        <EmptyState
                            icon={<PieChart className="h-12 w-12 text-gray-500" />}
                            title="No open positions"
                            description="Positions appear here after you buy a stock."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {positions.map((pos) => (
                                <PositionCard key={pos.positionId} position={pos} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Trade detail dialog */}
            <TradeDetailDialog
                trade={selectedTrade}
                open={!!selectedTradeId}
                onClose={() => setSelectedTradeId(null)}
            />
        </div>
    );
};

// ---- Sub-components ----

function StatCard({
    icon,
    label,
    value,
    sub,
    valueColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    valueColor?: string;
}) {
    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm text-gray-500">{label}</span>
            </div>
            <p className={`text-xl font-bold ${valueColor ?? 'text-gray-100'}`}>
                {value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    label,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                active
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-500 hover:text-gray-400'
            }`}
        >
            {label}
        </button>
    );
}

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
            <p className="text-gray-500 text-sm max-w-sm text-center">{description}</p>
        </div>
    );
}

export default PaperTraderClient;
