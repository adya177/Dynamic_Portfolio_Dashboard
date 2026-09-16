'use client';
import { useState, useEffect } from 'react';
import PortfolioTable from './PortfolioTable';

export type StockHolding = {
    particulars: string;
    ticker: string;
    qty: number;
    purchasePrice: number;
    cmp: number;
    peRatio: number;
    latestEarnings: string;
    sector: string;
};

const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export default function PortfolioDashboard({ initialHoldings }: { initialHoldings: StockHolding[] }) {
    const [holdings, setHoldings] = useState<StockHolding[]>(() => initialHoldings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setHoldings(initialHoldings);
    }, [initialHoldings]);

    useEffect(() => {
        let isActive = true;

        const fetchLiveUpdates = async () => {
            setLoading(true);
            try {
                const updatedHoldings = await Promise.all(
                    initialHoldings.map(async (stock) => {
                        const ticker = stock.ticker || stock.particulars;
                        const res = await fetch(`/api/stock?ticker=${encodeURIComponent(ticker)}`);
                        if (!res.ok) {
                            return stock;
                        }

                        const data = await res.json();
                        return {
                            ...stock,
                            cmp: typeof data.cmp === 'number' ? data.cmp : stock.cmp,
                            peRatio: typeof data.peRatio === 'number' ? data.peRatio : stock.peRatio,
                            latestEarnings: data.latestEarnings || stock.latestEarnings,
                        };
                    })
                );

                if (isActive) {
                    setHoldings(updatedHoldings);
                }
            } catch (error) {
                console.error('Failed to fetch live updates', error);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchLiveUpdates();
        const intervalId = setInterval(fetchLiveUpdates, 15000);

        return () => {
            isActive = false;
            clearInterval(intervalId);
        };
    }, [initialHoldings]);

    const totalInvested = holdings.reduce((sum, stock) => sum + stock.purchasePrice * stock.qty, 0);
    const totalMarketValue = holdings.reduce((sum, stock) => sum + stock.cmp * stock.qty, 0);
    const totalGain = totalMarketValue - totalInvested;
    const sectorCount = new Set(holdings.map((stock) => stock.sector)).size;

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-sky-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4 shadow-[0_8px_20px_rgba(59,130,246,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(59,130,246,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-700">Total Invested</p>
                        <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.18em] text-sky-700">₹</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">{currency(totalInvested)}</p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_100%)] p-4 shadow-[0_8px_20px_rgba(16,185,129,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,185,129,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Current Value</p>
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.18em] text-emerald-700">Live</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">{currency(totalMarketValue)}</p>
                </div>

                <div className="rounded-xl border border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-4 shadow-[0_8px_20px_rgba(245,158,11,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(245,158,11,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-700">Net Gain/Loss</p>
                        <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.18em] ${totalGain >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {totalGain >= 0 ? 'Up' : 'Down'}
                        </span>
                    </div>
                    <p className={`mt-2 text-lg font-semibold md:text-xl ${totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currency(totalGain)}
                    </p>
                </div>

                <div className="rounded-xl border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] p-4 shadow-[0_8px_20px_rgba(139,92,246,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(139,92,246,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-700">Active Sectors</p>
                        <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.18em] text-violet-700">Mix</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">{sectorCount}</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(148,163,184,0.08)] md:p-4">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 md:text-lg">Portfolio Holdings</h2>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Asset Allocation Overview</p>
                    </div>
                    {loading && <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-600">Refreshing</span>}
                </div>
                <PortfolioTable data={holdings} />
            </div>
        </div>
    );
}