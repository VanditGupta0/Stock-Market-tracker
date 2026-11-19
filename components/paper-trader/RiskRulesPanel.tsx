'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRiskSettings, saveRiskSettings } from '@/lib/actions/paperTraderRisk.actions';

/** Stop-loss and take-profit rules. `onSaved` lets the parent reload the account (position levels change). */
export default function RiskRulesPanel({ onSaved }: { onSaved: () => void | Promise<void> }) {
    const [enabled, setEnabled] = useState(true);
    const [stop, setStop] = useState('5');
    const [take, setTake] = useState('10');
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

    useEffect(() => {
        let cancelled = false;
        getRiskSettings()
            .then((s) => {
                if (cancelled) return;
                setEnabled(s.enabled);
                setStop(String(s.stopLossPercent));
                setTake(String(s.takeProfitPercent));
            })
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const result = await saveRiskSettings({
                enabled,
                stopLossPercent: parseFloat(stop),
                takeProfitPercent: parseFloat(take),
            });
            if (result.ok) {
                setMessage({ text: 'Saved. Open positions now use these levels.', ok: true });
                await onSaved();
            } else {
                setMessage({ text: result.error, ok: false });
            }
        } catch {
            setMessage({ text: 'Could not save. Please try again.', ok: false });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-base font-semibold text-gray-100">Risk rules</h2>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        disabled={!loaded}
                        className="h-4 w-4 accent-yellow-500"
                    />
                    Auto-close on
                </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="stop-loss" className="text-xs text-gray-400">
                        Stop-loss (% below buy price)
                    </label>
                    <div className="relative">
                        <Input
                            id="stop-loss"
                            type="number"
                            min={0.5}
                            max={50}
                            step={0.5}
                            value={stop}
                            onChange={(e) => setStop(e.target.value)}
                            disabled={!loaded}
                            className="form-input pr-7"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="take-profit" className="text-xs text-gray-400">
                        Take-profit (% above buy price)
                    </label>
                    <div className="relative">
                        <Input
                            id="take-profit"
                            type="number"
                            min={0.5}
                            max={200}
                            step={0.5}
                            value={take}
                            onChange={(e) => setTake(e.target.value)}
                            disabled={!loaded}
                            className="form-input pr-7"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
                Checked on every scan. A position is sold in full when its price falls to the stop-loss or rises to the
                take-profit level. Applies to new buys and to positions that are open now.
            </p>

            <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving || !loaded} className="yellow-btn px-5">
                    {saving ? 'Saving…' : 'Save rules'}
                </Button>
                {message && (
                    <span className={`text-xs ${message.ok ? 'text-teal-400' : 'text-red-400'}`}>{message.text}</span>
                )}
            </div>
        </div>
    );
}
