import { useMemo } from 'react';
import LightweightChart from './LightweightChart';

// Adapter to render our year-indexed calculator series in lightweight-charts
// Expects data as array of { year: string | number, value: number } or
// generic arrays where a selector function maps to { time, value }

const ProjectionChartLW = ({ data, title = 'Projection', currency = 'INR', precision = 0 }) => {
  const series = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const baseTs = Date.UTC(2000, 0, 1) / 1000; // UTCTimestamp (seconds)
    const tsAt = (i) => baseTs + i * 365 * 24 * 60 * 60; // approx yearly spacing
    // Try common calculator shapes
    if (data.length && data[0].year !== undefined && data[0]['Current Value'] !== undefined) {
      return data.map((d, i) => ({ time: tsAt(i), value: d['Current Value'] }));
    }
    if (data.length && data[0].year !== undefined && data[0].corpus !== undefined) {
      return data.map((d, i) => ({ time: tsAt(i), value: d.corpus }));
    }
    if (data.length && data[0].year !== undefined) {
      return data.map((d, i) => ({ time: tsAt(i), value: d.value ?? d.amount ?? 0 }));
    }
    return [];
  }, [data]);

  return <LightweightChart title={title} data={series} currency={currency} precision={precision} />;
};

export default ProjectionChartLW;
