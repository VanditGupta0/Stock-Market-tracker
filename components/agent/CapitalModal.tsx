"use client";

import React, { useState } from "react";
import { StrategyProfile } from "@/lib/agent/types";
import { Coins, X, Check, Shield, Zap, Scale } from "lucide-react";

interface CapitalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCapital: number;
    currentStrategy: StrategyProfile;
    onConfirm: (amount: number, strategy: StrategyProfile) => void;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000, 500000, 1000000];

export default function CapitalModal({
    isOpen,
    onClose,
    currentCapital,
    currentStrategy,
    onConfirm,
}: CapitalModalProps) {
    const [amount, setAmount] = useState<number>(currentCapital);
    const [strategy, setStrategy] = useState<StrategyProfile>(currentStrategy);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) return;
        onConfirm(amount, strategy);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        <Coins className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Assign Paper Trading Capital</h2>
                        <p className="text-xs text-slate-400">Configure the capital budget and operating strategy for the AI Agent.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Trading Capital (₹ / $)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                                ₹
                            </span>
                            <input
                                type="number"
                                min="1000"
                                max="100000000"
                                step="1000"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full rounded-xl border border-white/10 bg-[#1f1f1f] py-3 pl-10 pr-4 text-white text-lg font-semibold focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                placeholder="Enter amount..."
                                required
                            />
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {PRESET_AMOUNTS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(preset)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                                        amount === preset
                                            ? "border-amber-400 bg-amber-400/10 text-amber-400"
                                            : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                                    }`}
                                >
                                    ₹{preset >= 100000 ? `${(preset / 100000).toFixed(0)} Lakh` : `${preset.toLocaleString()}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Strategy Profile Picker */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Investment Strategy Profile
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setStrategy("balanced")}
                                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                                    strategy === "balanced"
                                        ? "border-amber-400 bg-amber-400/10 text-white"
                                        : "border-white/5 bg-[#1a1a1a] text-slate-400 hover:border-white/20"
                                }`}
                            >
                                <Scale className={`h-4 w-4 mb-1.5 ${strategy === "balanced" ? "text-amber-400" : "text-slate-400"}`} />
                                <span className="text-xs font-bold text-white">Balanced</span>
                                <span className="text-[10px] text-slate-400 mt-1">Equal weight between news sentiment and EMA trend momentum.</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStrategy("aggressive")}
                                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                                    strategy === "aggressive"
                                        ? "border-amber-400 bg-amber-400/10 text-white"
                                        : "border-white/5 bg-[#1a1a1a] text-slate-400 hover:border-white/20"
                                }`}
                            >
                                <Zap className={`h-4 w-4 mb-1.5 ${strategy === "aggressive" ? "text-amber-400" : "text-slate-400"}`} />
                                <span className="text-xs font-bold text-white">Aggressive</span>
                                <span className="text-[10px] text-slate-400 mt-1">Larger position sizes targeting high-beta breakout catalysts.</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStrategy("value")}
                                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                                    strategy === "value"
                                        ? "border-amber-400 bg-amber-400/10 text-white"
                                        : "border-white/5 bg-[#1a1a1a] text-slate-400 hover:border-white/20"
                                }`}
                            >
                                <Shield className={`h-4 w-4 mb-1.5 ${strategy === "value" ? "text-amber-400" : "text-slate-400"}`} />
                                <span className="text-xs font-bold text-white">Value & Div</span>
                                <span className="text-[10px] text-slate-400 mt-1">Favors low P/E, established bluechips with steady news support.</span>
                            </button>
                        </div>
                    </div>

                    {/* Disclaimer Note */}
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-slate-400">
                        Changing the starting capital will reset your paper trading balance and clear open positions to establish the new capital baseline.
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                        >
                            <Check className="h-4 w-4" />
                            Assign Capital & Start
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
