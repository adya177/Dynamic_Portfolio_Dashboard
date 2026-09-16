import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function normalizeTicker(ticker: string) {
    return ticker.trim().toUpperCase().replace(/\.(NS|BSE)$/i, '').replace(/[^A-Z0-9]/g, '');
}

async function fetchYahooFinanceCMP(ticker: string) {
    try {
        const symbol = normalizeTicker(ticker);
        const yahooTicker = /^[A-Z]/.test(symbol) ? `${symbol}.NS` : symbol;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=1d&range=1d`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                Accept: 'application/json',
            },
            next: { revalidate: 15 },
        });

        if (!response.ok) {
            return null;
        }

        const json = await response.json();
        const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
        return typeof price === 'number' ? price : null;
    } catch (error) {
        console.error(`Error fetching Yahoo Finance CMP for ${ticker}:`, error);
        return null;
    }
}

async function fetchGoogleFinanceMetrics(ticker: string) {
    try {
        const symbol = normalizeTicker(ticker);
        const googleUrl = `https://www.google.com/finance/quote/${symbol}:NSE`;
        const response = await fetch(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                Accept: 'text/html',
            },
        });

        if (!response.ok) {
            return { peRatio: null, latestEarnings: null };
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const fullText = $('body').text();

        const peMatch = fullText.match(/P\/E\s*ratio[^0-9]*([0-9]+(?:\.[0-9]+)?)/i);
        const earningsMatch = fullText.match(/latest\s*earnings[^0-9]*([A-Za-z0-9\s/.-]+)/i);

        return {
            peRatio: peMatch ? Number(peMatch[1]) : null,
            latestEarnings: earningsMatch ? earningsMatch[1].trim() : null,
        };
    } catch (error) {
        console.error(`Error fetching Google Finance metrics for ${ticker}:`, error);
        return { peRatio: null, latestEarnings: null };
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const [cmp, metrics] = await Promise.all([
        fetchYahooFinanceCMP(ticker),
        fetchGoogleFinanceMetrics(ticker),
    ]);

    return NextResponse.json({
        ticker,
        cmp,
        peRatio: metrics.peRatio,
        latestEarnings: metrics.latestEarnings,
    });
}