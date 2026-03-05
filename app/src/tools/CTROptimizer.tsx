import { useContext, useMemo, useState } from 'react';
import { Upload, Database, AlertCircle, Sparkles, Copy } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { GSCContext } from '@/contexts/app-context';
import { buildCtrOptimizerRows, parseGscCsv } from '@/utils/gscData';
import type { CTROptimizerRow, GSCPerformanceRow } from '@/types';

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function getPriorityClasses(priority: CTROptimizerRow['priority']): string {
  if (priority === 'High') return 'text-red-300 bg-red-500/10 border-red-500/30';
  if (priority === 'Medium') return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
  return 'text-text-secondary bg-white/5 border-white/10';
}

function getTitleSuggestions(row: CTROptimizerRow): string[] {
  return [
    `${row.query} | Proven Results & Clear Next Steps`,
    `How to Improve ${row.query}: Practical Strategies for Better CTR`,
    `${row.query}: What to Fix First to Win More Clicks`,
  ];
}

function getMetaSuggestions(row: CTROptimizerRow): string[] {
  return [
    `Discover actionable tips for ${row.query}. See what to improve on ${row.page} and increase clicks from search.`,
    `Improve your visibility for ${row.query} with focused updates to title, meta, and page intent alignment.`,
  ];
}

function buildNarratives(row: CTROptimizerRow) {
  const gapPct = Math.max(0, row.ctrGap * 100);
  const urgency = gapPct >= 5 ? 'High' : gapPct >= 2 ? 'Medium' : 'Low';
  const positionBand = row.position <= 5 ? 'top-of-page' : row.position <= 12 ? 'mid-SERP' : 'lower-SERP';
  const benefit = row.priority === 'High' ? 'win back high-value clicks' : 'lift engagement efficiently';

  const titles = [
    `${row.query} | ${urgency} CTR play to ${benefit}`,
    `${row.query} — Beat ${positionBand} slump with clearer value`,
    `${row.query}: Close ${gapPct.toFixed(1)}% CTR gap with sharper promise`,
  ];

  const metas = [
    `Searchers for "${row.query}" want quick proof. Lead with outcome + social proof to recover the ${gapPct.toFixed(1)}% CTR gap and ${benefit}.`,
    `Tighten first 120 chars for "${row.query}": result → proof → recency. Suits position ${row.position.toFixed(
      1,
    )} to lift clicks without waiting for rank changes.`,
  ];

  return { titles, metas, gapPct, urgency };
}

export default function CTROptimizer() {
  const { gscRows, setGscRows, gscSource, setGscSource } = useContext(GSCContext);
  const [workingRows, setWorkingRows] = useState<GSCPerformanceRow[]>(() => gscRows ?? []);
  const [sourceLabel, setSourceLabel] = useState<string>(() =>
    gscRows && gscRows.length > 0
      ? `Using GSC Visualizer session data (${gscSource || 'uploaded CSV'})`
      : 'No data loaded yet',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<CTROptimizerRow | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const rows = useMemo(() => buildCtrOptimizerRows(workingRows), [workingRows]);

  const handleUseSessionData = () => {
    if (!gscRows || gscRows.length === 0) {
      setErrorMessage('No GSC Visualizer session data found. Upload CSV or first upload data in GSC Visualizer.');
      return;
    }

    setErrorMessage(null);
    setWorkingRows(gscRows);
    setSourceLabel(`Using GSC Visualizer session data (${gscSource || 'uploaded CSV'})`);
    setSelectedRow(null);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      window.setTimeout(() => setCopiedText((current) => (current === text ? null : current)), 1200);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

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
    setWorkingRows(parsed.rows);
    setSourceLabel(`Using uploaded CSV: ${file.name}`);
    setSelectedRow(null);
    setGscRows(parsed.rows);
    setGscSource(file.name);
  };

  return (
    <Layout title="CTR Optimizer">
      <div className="space-y-6">
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">CTR Optimizer</h2>
          <p className="text-text-secondary mb-5">
            Find high-impression, underperforming queries and prioritize metadata updates.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <button type="button" onClick={handleUseSessionData} className="btn-outline flex items-center gap-2 justify-center">
              <Database className="w-4 h-4" />
              Use GSC Visualizer Data
            </button>

            <label className="btn-lime cursor-pointer flex items-center gap-2 justify-center">
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

        {rows.length > 0 ? (
          <>
            <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Query</th>
                      <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Page</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Position</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Impressions</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Clicks</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">CTR</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Expected CTR</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">CTR Gap</th>
                      <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={`${row.query}-${row.page}`}
                        className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer"
                        onClick={() => setSelectedRow(row)}
                      >
                        <td className="px-4 py-3 text-text-primary">{row.query || '(not set)'}</td>
                        <td className="px-4 py-3 text-text-secondary text-sm">{row.page || '(not set)'}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{row.position.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{formatNumber(row.impressions)}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{formatNumber(row.clicks)}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{formatPercent(row.ctr)}</td>
                        <td className="px-4 py-3 text-right text-text-primary">{formatPercent(row.expectedCtr)}</td>
                        <td className="px-4 py-3 text-right text-red-300">{formatPercent(row.ctrGap)}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${getPriorityClasses(row.priority)}`}
                          >
                            {row.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRow && (
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-lime" />
                  <h3 className="text-lg font-semibold text-text-primary">Suggested Title / Meta Angle</h3>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <p className="text-text-secondary text-sm mb-1">Current query</p>
                  <p className="text-text-primary font-medium">{selectedRow.query || '(not set)'}</p>
                </div>

                <div>
                  <p className="text-text-secondary text-sm mb-2">Suggested title patterns</p>
                  <ul className="space-y-2">
                    {getTitleSuggestions(selectedRow).map((title) => (
                      <li key={title} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-text-primary">
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-text-secondary text-sm mb-2">Suggested meta description patterns</p>
                  <ul className="space-y-2">
                    {getMetaSuggestions(selectedRow).map((meta) => (
                      <li key={meta} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-text-primary">
                        {meta}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTR Narrative Generator */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <h4 className="text-base font-semibold text-text-primary">CTR Narrative Generator</h4>
                  </div>
                  {(() => {
                    const narratives = buildNarratives(selectedRow);
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-text-secondary text-sm">AI title narratives</p>
                            <span className="text-xs text-text-secondary">Gap: {narratives.gapPct.toFixed(1)}%</span>
                          </div>
                          {narratives.titles.map((title) => (
                            <div key={title} className="flex items-start gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(title)}
                                className="p-2 rounded-md hover:bg-white/10 transition-colors"
                                aria-label="Copy title"
                              >
                                <Copy className="w-4 h-4 text-text-secondary" />
                              </button>
                              <p className="text-text-primary text-sm leading-5">
                                {title}
                                {copiedText === title && <span className="text-lime text-xs ml-2">copied</span>}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-text-secondary text-sm">AI meta narratives</p>
                            <span className="text-xs text-text-secondary">Urgency: {narratives.urgency}</span>
                          </div>
                          {narratives.metas.map((meta) => (
                            <div key={meta} className="flex items-start gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(meta)}
                                className="p-2 rounded-md hover:bg-white/10 transition-colors"
                                aria-label="Copy meta"
                              >
                                <Copy className="w-4 h-4 text-text-secondary" />
                              </button>
                              <p className="text-text-primary text-sm leading-5">
                                {meta}
                                {copiedText === meta && <span className="text-lime text-xs ml-2">copied</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">No CTR data loaded</h3>
            <p className="text-text-secondary max-w-xl mx-auto">
              Click "Use GSC Visualizer Data" if you already uploaded a CSV in this session, or upload a GSC CSV directly here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
