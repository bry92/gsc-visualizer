import { useContext, useMemo, useState } from 'react';
import { Upload, Link as LinkIcon, BarChart3, AlertCircle } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { GSCContext } from '@/contexts/app-context';
import {
  buildGscTrends,
  buildOpportunities,
  calculateGscOverview,
  getMockGscRows,
  parseGscCsv,
} from '@/utils/gscData';
import type { GSCTrendPoint } from '@/types';

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatPosition(value: number): string {
  return value > 0 ? value.toFixed(2) : '--';
}

function buildPlaceholderTrends(base: GSCTrendPoint[]): GSCTrendPoint[] {
  if (base.length > 0) return base;

  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const clicks = 80 + index * 6;
    const impressions = 1200 + index * 75;

    return {
      date: date.toISOString().slice(0, 10),
      clicks,
      impressions,
      ctr: clicks / impressions,
      avgPosition: 10.8 - index * 0.12,
    };
  });
}

interface TrendCardProps {
  title: string;
  data: GSCTrendPoint[];
  colorClass: string;
  valueAccessor: (point: GSCTrendPoint) => number;
  valueFormatter: (value: number) => string;
}

function TrendCard({ title, data, colorClass, valueAccessor, valueFormatter }: TrendCardProps) {
  const values = data.map(valueAccessor);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? 10 : (index / (values.length - 1)) * 100;
      const y = 45 - ((value - minValue) / range) * 40;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const latestValue = values[values.length - 1] ?? 0;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-text-secondary text-sm">{title}</p>
        <span className="text-text-primary font-medium text-sm">{valueFormatter(latestValue)}</span>
      </div>
      <svg viewBox="0 0 100 48" className="w-full h-24">
        <defs>
          <linearGradient id={`trendGradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className={colorClass} stopOpacity="0.35" />
            <stop offset="100%" className={colorClass} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="currentColor"
          className={colorClass}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <div className="flex justify-between mt-2 text-xs text-text-secondary">
        <span>{data[0]?.date ?? '--'}</span>
        <span>{data[data.length - 1]?.date ?? '--'}</span>
      </div>
    </div>
  );
}

export default function GSCDataVisualizer() {
  const { gscRows, setGscRows, gscSource, setGscSource } = useContext(GSCContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleRows = useMemo(() => getMockGscRows(), []);
  const activeRows = gscRows && gscRows.length > 0 ? gscRows : sampleRows;
  const usingMockData = !gscRows || gscRows.length === 0;

  const overview = useMemo(() => calculateGscOverview(activeRows), [activeRows]);
  const actualTrends = useMemo(() => buildGscTrends(activeRows), [activeRows]);
  const trends = useMemo(() => buildPlaceholderTrends(actualTrends), [actualTrends]);
  const opportunities = useMemo(() => buildOpportunities(activeRows), [activeRows]);

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseGscCsv(text);

    if (parsed.missingColumns.length > 0) {
      setErrorMessage(
        `Missing required columns: ${parsed.missingColumns.join(', ')}. Required columns are Query, Page, Clicks, Impressions, CTR, Position.`,
      );
      return;
    }

    setErrorMessage(null);
    setGscRows(parsed.rows);
    setGscSource(file.name);
  };

  return (
    <Layout title="Google Search Console Visualizer">
      <div className="space-y-6">
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-1">
            Google Search Console Visualizer
          </h2>
          <p className="text-text-secondary mb-6">
            Connect GSC to visualize clicks, impressions, CTR, and position.
          </p>

          <div className="flex flex-col lg:flex-row gap-4">
            <button
              type="button"
              disabled
              className="btn-outline flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
            >
              <LinkIcon className="w-4 h-4" />
              Connect Google Search Console
            </button>

            <label className="btn-lime cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload GSC CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
            </label>
          </div>

          <p className="text-sm text-text-secondary mt-4">
            Data source: {usingMockData ? 'Sample data (no CSV uploaded yet)' : gscSource || 'Uploaded CSV'}
          </p>

          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-light border border-white/5 rounded-2xl p-5">
              <p className="text-text-secondary text-sm">Clicks</p>
              <p className="text-2xl font-display font-bold text-lime mt-1">{formatNumber(overview.totalClicks)}</p>
            </div>
            <div className="bg-dark-light border border-white/5 rounded-2xl p-5">
              <p className="text-text-secondary text-sm">Impressions</p>
              <p className="text-2xl font-display font-bold text-blue-400 mt-1">
                {formatNumber(overview.totalImpressions)}
              </p>
            </div>
            <div className="bg-dark-light border border-white/5 rounded-2xl p-5">
              <p className="text-text-secondary text-sm">CTR</p>
              <p className="text-2xl font-display font-bold text-purple-400 mt-1">
                {formatPercent(overview.averageCtr)}
              </p>
            </div>
            <div className="bg-dark-light border border-white/5 rounded-2xl p-5">
              <p className="text-text-secondary text-sm">Avg Position</p>
              <p className="text-2xl font-display font-bold text-orange-400 mt-1">
                {formatPosition(overview.averagePosition)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-text-primary">Trends</h3>
            {actualTrends.length === 0 && (
              <span className="text-xs text-text-secondary">
                Date column not found in CSV. Showing placeholder trends.
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendCard
              title="Clicks by Date"
              data={trends}
              colorClass="text-lime"
              valueAccessor={(point) => point.clicks}
              valueFormatter={(value) => formatNumber(Math.round(value))}
            />
            <TrendCard
              title="Impressions by Date"
              data={trends}
              colorClass="text-blue-400"
              valueAccessor={(point) => point.impressions}
              valueFormatter={(value) => formatNumber(Math.round(value))}
            />
            <TrendCard
              title="CTR by Date"
              data={trends}
              colorClass="text-purple-400"
              valueAccessor={(point) => point.ctr}
              valueFormatter={(value) => formatPercent(value)}
            />
            <TrendCard
              title="Avg Position by Date"
              data={trends}
              colorClass="text-orange-400"
              valueAccessor={(point) => point.avgPosition}
              valueFormatter={(value) => formatPosition(value)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Opportunities</h3>
          <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-text-secondary text-sm">
              <BarChart3 className="w-4 h-4" />
              Sorted by Opportunity Score (desc)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Query</th>
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Page</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Impressions</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Clicks</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">CTR</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Position</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">
                      Opportunity Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((row) => (
                    <tr key={`${row.query}-${row.page}`} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-primary">{row.query || '(not set)'}</td>
                      <td className="px-4 py-3 text-text-secondary text-sm">{row.page || '(not set)'}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{formatNumber(row.impressions)}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{formatNumber(row.clicks)}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{formatPercent(row.ctr)}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{formatPosition(row.position)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-lime/10 text-lime font-semibold">
                          {row.opportunityScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

