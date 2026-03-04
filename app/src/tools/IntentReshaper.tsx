import { useContext, useMemo, useState } from 'react';
import { AlertCircle, Database, Upload, Shuffle, Copy } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { GSCContext } from '@/App';
import { classifyQueryIntent, parseGscCsv } from '@/utils/gscData';
import type { GSCPerformanceRow } from '@/types';

type DriftRow = {
  query: string;
  fromIntent: string;
  toIntent: string;
  recentImpressions: number;
  recentClicks: number;
  recommendations: string[];
};

function formatIntent(intent: string) {
  return intent || 'Unknown';
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function getRecommendations(newIntent: string): string[] {
  switch (newIntent) {
    case 'Transactional':
      return ['Add pricing/CTA above the fold', 'Include trust badges & social proof', 'Add concise feature-benefit bullets'];
    case 'Commercial':
      return ['Add comparison table', 'Include pros/cons bullets', 'Embed recent reviews or testimonials'];
    case 'Navigational':
      return ['Surface brand/contact info high on page', 'Add clear site navigation links', 'Ensure logo + breadcrumbs are visible'];
    default:
      return ['Expand FAQ to cover common sub-questions', 'Add step-by-step how-to section', 'Include fresh stats/examples for 2026'];
  }
}

function splitByTime(rows: GSCPerformanceRow[]) {
  const dated = rows
    .filter((row) => row.date)
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
  if (dated.length < 2) return { early: dated, late: dated };
  const mid = Math.floor(dated.length / 2);
  return { early: dated.slice(0, mid), late: dated.slice(mid) };
}

function dominantIntent(rows: GSCPerformanceRow[]): string {
  if (rows.length === 0) return 'Unknown';
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const intent = classifyQueryIntent(row.query);
    counts.set(intent, (counts.get(intent) || 0) + row.impressions);
  });
  let best = 'Unknown';
  let bestScore = -1;
  counts.forEach((score, intent) => {
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  });
  return best;
}

function detectDrift(rows: GSCPerformanceRow[]): DriftRow[] {
  const byQuery = new Map<string, GSCPerformanceRow[]>();
  rows.forEach((row) => {
    if (!byQuery.has(row.query)) byQuery.set(row.query, []);
    byQuery.get(row.query)?.push(row);
  });

  const results: DriftRow[] = [];

  byQuery.forEach((queryRows, query) => {
    const { early, late } = splitByTime(queryRows);
    if (early.length === 0 || late.length === 0) return;
    const fromIntent = dominantIntent(early);
    const toIntent = dominantIntent(late);
    if (fromIntent === toIntent) return;

    const recentImpressions = late.reduce((sum, row) => sum + row.impressions, 0);
    const recentClicks = late.reduce((sum, row) => sum + row.clicks, 0);

    results.push({
      query,
      fromIntent,
      toIntent,
      recentImpressions,
      recentClicks,
      recommendations: getRecommendations(toIntent),
    });
  });

  return results.sort((a, b) => b.recentImpressions - a.recentImpressions);
}

export default function IntentReshaper() {
  const { gscRows, setGscRows, gscSource, setGscSource } = useContext(GSCContext);
  const [workingRows, setWorkingRows] = useState<GSCPerformanceRow[]>(() => gscRows ?? []);
  const [sourceLabel, setSourceLabel] = useState<string>(() =>
    gscRows && gscRows.length > 0 ? `Using GSC Visualizer data (${gscSource || 'uploaded CSV'})` : 'No data loaded yet',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const driftRows = useMemo(() => detectDrift(workingRows), [workingRows]);

  const handleUseSessionData = () => {
    if (!gscRows || gscRows.length === 0) {
      setErrorMessage('No GSC Visualizer session data found. Upload CSV or load data there first.');
      return;
    }
    setErrorMessage(null);
    setWorkingRows(gscRows);
    setSourceLabel(`Using GSC Visualizer data (${gscSource || 'uploaded CSV'})`);
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseGscCsv(text);
    if (parsed.missingColumns.length > 0) {
      setErrorMessage(
        `Missing required columns: ${parsed.missingColumns.join(', ')}. Required: Query, Page, Clicks, Impressions, CTR, Position (Date optional).`,
      );
      return;
    }
    setErrorMessage(null);
    setWorkingRows(parsed.rows);
    setSourceLabel(`Using uploaded CSV: ${file.name}`);
    setGscRows(parsed.rows);
    setGscSource(file.name);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied((current) => (current === text ? null : current)), 1200);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <Layout title="Intent Drift Reshaper">
      <div className="space-y-6">
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Intent Drift Reshaper</h2>
          <p className="text-text-secondary mb-5">
            Detect when queries change intent over time and get an immediate content reshape plan to keep CTR healthy.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <button type="button" onClick={handleUseSessionData} className="btn-outline flex items-center justify-center gap-2">
              <Database className="w-4 h-4" />
              Use GSC Visualizer Data
            </button>
            <label className="btn-lime cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
            </label>
          </div>
          <p className="text-sm text-text-secondary mt-4">{sourceLabel}</p>
          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        {driftRows.length > 0 ? (
          <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-text-secondary text-sm">
              <Shuffle className="w-4 h-4" />
              Queries with intent drift (early vs recent periods)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Query</th>
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">From → To</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Recent Impr.</th>
                    <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Recent Clicks</th>
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Reshape Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {driftRows.map((row) => {
                    const plan = `Query: ${row.query}\nDrift: ${row.fromIntent} -> ${row.toIntent}\nActions: ${row.recommendations.join(
                      '; ',
                    )}`;
                    return (
                      <tr key={row.query} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-text-primary">{row.query}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          {formatIntent(row.fromIntent)} → <span className="text-lime">{formatIntent(row.toIntent)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary">{formatNumber(row.recentImpressions)}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{formatNumber(row.recentClicks)}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              {row.recommendations.map((rec) => (
                                <span key={rec} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-text-primary">
                                  {rec}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(plan)}
                              className="inline-flex items-center gap-2 text-sm text-lime hover:underline w-fit"
                            >
                              <Copy className="w-4 h-4" />
                              {copied === plan ? 'Copied' : 'Copy plan'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">No intent drift detected yet</h3>
            <p className="text-text-secondary max-w-xl mx-auto">
              Upload GSC data with dates so we can compare early vs recent periods and spot intent shifts.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

