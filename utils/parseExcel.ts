import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface ParsedHolding {
    particulars: string;
    qty: number;
    purchasePrice: number;
    ticker: string;
    sector: string;
    cmp: number;           // Defaults to 0, updated via API
    peRatio: number;       // Defaults to 0, updated via API
    latestEarnings: string;// Defaults to "-", updated via API
}

const PORTFOLIO_FILE = 'F9001561_ADDBA737E8_B72562937A.xlsx';

function resolvePortfolioFilePath(): string {
    const candidatePaths = [
        path.resolve(process.cwd(), 'data', PORTFOLIO_FILE),
        path.resolve(process.cwd(), PORTFOLIO_FILE),
        path.resolve(process.cwd(), 'public', PORTFOLIO_FILE),
    ];

    const validPath = candidatePaths.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).size > 0);

    if (!validPath) {
        throw new Error(`Portfolio file not found. Checked: ${candidatePaths.join(', ')}`);
    }

    return validPath;
}

const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.\-]/g, '');
        if (!cleaned) return 0;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const toString = (value: unknown): string => String(value ?? '').trim();

export function getInitialHoldings(): ParsedHolding[] {
    const filePath = resolvePortfolioFilePath();
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false, defval: null });

    const holdings: ParsedHolding[] = [];
    let currentSector = 'Uncategorized';

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const noCol = toString(row[0]);
        const particularsCol = toString(row[1]);

        if (!particularsCol) continue;

        if (particularsCol === 'Particulars') continue;

        if (!noCol && particularsCol) {
            currentSector = particularsCol;
            continue;
        }

        if (noCol && particularsCol) {
            const ticker = toString(row[6]).toUpperCase();

            holdings.push({
                particulars: particularsCol,
                purchasePrice: toNumber(row[2]),
                qty: toNumber(row[3]),
                ticker: ticker && ticker !== 'NSE/BSE' ? ticker : particularsCol,
                sector: currentSector,
                cmp: 0,
                peRatio: 0,
                latestEarnings: '-',
            });
        }
    }

    return holdings;
}