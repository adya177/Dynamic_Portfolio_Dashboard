'use client';
import { useTable, flexRender, createColumnHelper, tableFeatures } from '@tanstack/react-table';
import type { StockHolding } from './PortfolioDashboard';

const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
const number = (value: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value || 0);

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, StockHolding>();

const columns = columnHelper.columns([
    columnHelper.accessor('particulars', { header: 'Particulars' }),
    columnHelper.accessor('ticker', { header: 'Ticker' }),
    columnHelper.accessor('qty', { header: 'Qty', cell: info => number(info.getValue()) }),
    columnHelper.accessor('purchasePrice', { header: 'Purchase Price', cell: info => currency(info.getValue()) }),
    columnHelper.accessor('cmp', { header: 'CMP', cell: info => currency(info.getValue()) }),
    columnHelper.accessor(row => row.cmp * row.qty, {
        id: 'presentValue',
        header: 'Present Value',
        cell: info => currency(info.getValue()),
    }),
    columnHelper.accessor(row => (row.cmp * row.qty) - (row.purchasePrice * row.qty), {
        id: 'gainLoss',
        header: 'Gain/Loss',
        cell: info => {
            const value = info.getValue();
            const colorClass = value >= 0 ? 'text-emerald-600' : 'text-rose-600';
            return <span className={`font-semibold ${colorClass}`}>{currency(value)}</span>;
        },
    }),
    columnHelper.accessor('peRatio', { header: 'P/E Ratio', cell: info => info.getValue() ? number(info.getValue()) : '—' }),
    columnHelper.accessor('latestEarnings', { header: 'Latest Earnings', cell: info => info.getValue() || '—' }),
    columnHelper.accessor('sector', { header: 'Sector' }),
]);

export default function PortfolioTable({ data }: { data: StockHolding[] }) {
    const table = useTable({
        data,
        columns,
        features,
    });

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
            <table className="min-w-full table-auto border-collapse text-left text-[11px] leading-4">
                <thead className="bg-slate-100 text-slate-700">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="border-b border-slate-200 px-2.5 py-2.5 font-semibold uppercase tracking-[0.08em] text-[10px] align-middle">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="odd:bg-white even:bg-slate-50 transition-colors duration-150 hover:bg-slate-100/80">
                            {row.getAllCells().map(cell => (
                                <td key={cell.id} className="border-b border-slate-200 px-2.5 py-2 align-middle text-slate-700">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}