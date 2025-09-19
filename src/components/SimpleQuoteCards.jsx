import { useEffect, useState } from 'react';
import { fetchYahooQuotes } from '../utils/quoteData';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const Row = ({ name, price, changePercent, currency }) => {
  const positive = (changePercent ?? 0) >= 0;
  const fmt = currency === 'INR' ? inr : usd;
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm text-gray-200">{name}</div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold text-gray-100">{price != null ? fmt.format(price) : '—'}</div>
        <div className={`text-xs px-2 py-0.5 rounded ${positive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
          {changePercent != null ? `${positive ? '+' : ''}${changePercent.toFixed(2)}%` : '—'}
        </div>
      </div>
    </div>
  );
};

const SimpleQuoteCards = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchYahooQuotes(['BTC-USD', 'ETH-USD', 'DOGE-USD', 'USDT-USD']);
        if (!mounted) return;
        const cryptoItems = c.map((q) => ({
          key: q.symbol,
          name: q.shortName,
          price: q.price,
          changePercent: q.changePercent,
          currency: 'USD',
          group: 'Crypto',
        }));
        setItems(cryptoItems);
      } catch {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      {loading && <div className="py-6 text-sm text-gray-400">Loading…</div>}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.key} className="rounded-xl border border-gray-200/10 bg-white/5 p-3">
              <div className="text-[10px] text-gray-400 mb-1">{it.group}</div>
              <Row name={it.name} price={it.price} changePercent={it.changePercent} currency={it.currency} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleQuoteCards;
