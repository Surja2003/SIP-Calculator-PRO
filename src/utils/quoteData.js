const CACHE_MS = 60 * 1000; // 1 minute

const getKey = (symbols) => `yq:${symbols.sort().join(',')}`;

export async function fetchYahooQuotes(symbols = []) {
  if (!symbols.length) return [];
  const key = getKey(symbols);
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_MS) return data;
    }
  } catch {}

  const base = typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? '/yahoo'
    : 'https://query1.finance.yahoo.com';
  const url = `${base}/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quotes HTTP ${res.status}`);
  const json = await res.json();
  const data = (json?.quoteResponse?.result || []).map((q) => ({
    symbol: q.symbol,
    shortName: q.shortName || q.longName || q.symbol,
    price: q.regularMarketPrice,
    change: q.regularMarketChange,
    changePercent: q.regularMarketChangePercent,
    currency: q.currency,
    exchange: q.fullExchangeName || q.exchange,
  }));

  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
  return data;
}
