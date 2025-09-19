import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const LightweightChart = ({
  height = 300,
  data = [],
  title = 'Market Price',
  theme = 'dark',
  currency = 'INR',
  precision = 2,
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height,
      layout: {
        background: { type: 'solid', color: theme === 'dark' ? '#0b1220' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1f2937' : '#e5e7eb' },
        horzLines: { color: theme === 'dark' ? '#1f2937' : '#e5e7eb' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { mode: 1 },
      localization: {
        priceFormatter: (price) => new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency,
          maximumFractionDigits: precision,
        }).format(Number(price)),
      },
    });

    const series = chart.addAreaSeries({
      lineColor: '#4f46e5',
      topColor: 'rgba(79, 70, 229, 0.4)',
      bottomColor: 'rgba(79, 70, 229, 0.0)',
      priceFormat: { type: 'price', precision, minMove: 1 / Math.pow(10, precision) },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ autoSize: true });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, theme]);

  useEffect(() => {
    if (seriesRef.current) {
      const fallback = [
        { time: '2024-08-01', value: 100 },
        { time: '2024-09-01', value: 102 },
        { time: '2024-10-01', value: 98 },
        { time: '2024-11-01', value: 105 },
        { time: '2024-12-01', value: 110 },
        { time: '2025-01-01', value: 108 },
        { time: '2025-02-01', value: 115 },
      ];
      seriesRef.current.setData(data.length ? data : fallback);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">{title}</div>
      <div ref={containerRef} style={{ width: '100%', height }} />
    </div>
  );
};

export default LightweightChart;
