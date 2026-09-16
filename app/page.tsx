import PortfolioDashboard, { type StockHolding } from '@/components/PortfolioDashboard';
import { getInitialHoldings } from '@/utils/parseExcel';

export default function Home() {
    let initialHoldings: StockHolding[] = [];
    let loadError: string | null = null;

    try {
        initialHoldings = getInitialHoldings();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        loadError = 'Failed to load portfolio baseline data. Verify F9001561_ADDBA737E8_B72562937A.xlsx exists in the /data directory.';
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#edf6ff_0%,_#eaf7f5_25%,_#f8fbff_45%,_#f6f8fc_100%)] text-slate-800">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
                <header className="mb-5 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(59,130,246,0.08)]">
                    <div className="border-b border-sky-100 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_42%,#2563eb_100%)] px-6 py-4 md:px-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-sky-100 shadow-sm">
                                    Octa Byte AI Pvt Ltd
                                </div>
                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">Portfolio Performance Dashboard</h1>
                            </div>

                            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-sky-50 shadow-sm backdrop-blur-sm">
                                <div className="font-semibold text-white"></div>
                                <div className="mt-1 text-sky-100">WeWork Prestige Cube, Bangalore</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 bg-white px-6 py-3 text-xs text-slate-600 md:flex-row md:items-center md:justify-between md:px-8">
                        <p className="font-semibold text-slate-700">Dynamic Portfolio Dashboard</p>
                        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold uppercase tracking-[0.18em] text-emerald-700">
                            Live Market View
                        </div>
                    </div>
                </header>

                {loadError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                        {loadError}
                    </div>
                ) : (
                    <PortfolioDashboard initialHoldings={initialHoldings} />
                )}
            </div>
        </main>
    );
}