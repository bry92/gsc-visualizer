import { useState } from 'react';
import { 
  TrendingUp, Search, Plus, ArrowUpRight, ArrowDownRight, 
  Minus, Target, Download, Trash2,
  Globe
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { getRankData } from '@/utils/seoAnalyzer';
import type { RankData } from '@/types';

export default function RankTracker() {
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackedKeywords, setTrackedKeywords] = useState<RankData[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<RankData | null>(null);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !url) return;

    setIsLoading(true);
    try {
      const data = await getRankData(keyword, url);
      setTrackedKeywords([data, ...trackedKeywords]);
      setKeyword('');
    } catch (error) {
      console.error('Rank tracking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setTrackedKeywords(trackedKeywords.filter(k => k.keyword !== keywordToRemove));
    if (selectedKeyword?.keyword === keywordToRemove) {
      setSelectedKeyword(null);
    }
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-lime';
    if (position <= 10) return 'text-yellow-400';
    if (position <= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrend = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) return { icon: ArrowUpRight, color: 'text-lime', value: `+${diff}` };
    if (diff < 0) return { icon: ArrowDownRight, color: 'text-red-400', value: diff.toString() };
    return { icon: Minus, color: 'text-text-secondary', value: '0' };
  };

  // Generate chart points
  const generateChartPath = (history: { position: number }[]) => {
    const maxPos = Math.max(...history.map(h => h.position));
    const minPos = Math.min(...history.map(h => h.position));
    const range = maxPos - minPos || 1;
    
    const width = 400;
    const height = 150;
    const padding = 20;
    
    const points = history.map((h, i) => ({
      x: padding + (i / (history.length - 1)) * (width - 2 * padding),
      y: padding + ((h.position - minPos) / range) * (height - 2 * padding),
    }));
    
    return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  };

  return (
    <Layout title="Rank Tracker">
      <div className="space-y-6">
        {/* Add Keyword Section */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleAddKeyword} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword to track"
                className="input-dark w-full pl-12"
                required
              />
            </div>
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Your website URL"
                className="input-dark w-full pl-12"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-lime flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Track Keyword
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracked Keywords */}
        {trackedKeywords.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-lime" />
                  <span className="text-text-secondary text-sm">Keywords Tracked</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">{trackedKeywords.length}</p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-text-secondary text-sm">Top 10</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {trackedKeywords.filter(k => k.currentPosition <= 10).length}
                </p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                  <span className="text-text-secondary text-sm">Improved</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {trackedKeywords.filter(k => k.previousPosition > k.currentPosition).length}
                </p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                  <span className="text-text-secondary text-sm">Declined</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {trackedKeywords.filter(k => k.previousPosition < k.currentPosition).length}
                </p>
              </div>
            </div>

            {/* Keywords Table */}
            <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-text-primary">Tracked Keywords</h3>
                <button className="btn-outline text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Keyword</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Position</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Change</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Volume</th>
                      <th className="text-center text-text-secondary text-sm font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackedKeywords.map((data, index) => {
                      const trend = getTrend(data.currentPosition, data.previousPosition);
                      const TrendIcon = trend.icon;
                      
                      return (
                        <tr 
                          key={index} 
                          className="border-t border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => setSelectedKeyword(data)}
                        >
                          <td className="px-4 py-4">
                            <span className="text-text-primary font-medium">{data.keyword}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-display font-bold text-lg ${getPositionColor(data.currentPosition)}`}>
                              #{data.currentPosition}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className={`flex items-center justify-end gap-1 ${trend.color}`}>
                              <TrendIcon className="w-4 h-4" />
                              <span className="font-medium">{trend.value}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-text-primary">{data.searchVolume.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeKeyword(data.keyword);
                              }}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Keyword Detail Chart */}
            {selectedKeyword && (
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{selectedKeyword.keyword}</h3>
                    <p className="text-text-secondary text-sm">30-day ranking history</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-text-secondary text-sm">Current</p>
                      <p className={`text-2xl font-display font-bold ${getPositionColor(selectedKeyword.currentPosition)}`}>
                        #{selectedKeyword.currentPosition}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-secondary text-sm">Best</p>
                      <p className="text-2xl font-display font-bold text-lime">
                        #{selectedKeyword.highestPosition}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-48 relative">
                  <svg viewBox="0 0 400 150" className="w-full h-full">
                    {/* Grid lines */}
                    {[0, 1, 2, 3].map(i => (
                      <line
                        key={i}
                        x1="20"
                        y1={20 + i * 36}
                        x2="380"
                        y2={20 + i * 36}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Line */}
                    <path
                      d={generateChartPath(selectedKeyword.history)}
                      fill="none"
                      stroke="#B6FF2E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {selectedKeyword.history.map((h, i) => {
                      const maxPos = Math.max(...selectedKeyword.history.map(h => h.position));
                      const minPos = Math.min(...selectedKeyword.history.map(h => h.position));
                      const range = maxPos - minPos || 1;
                      const x = 20 + (i / (selectedKeyword.history.length - 1)) * 360;
                      const y = 20 + ((h.position - minPos) / range) * 110;
                      
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#B6FF2E"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Date labels */}
                <div className="flex justify-between text-text-secondary text-xs mt-2">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {trackedKeywords.length === 0 && !isLoading && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Track Your Rankings</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Add keywords to monitor your search engine positions over time. 
              Get daily updates and track your SEO progress.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['seo tools', 'digital marketing', 'website audit'].map((example) => (
                <button
                  key={example}
                  onClick={() => setKeyword(example)}
                  className="px-4 py-2 bg-white/5 rounded-lg text-text-secondary text-sm hover:bg-white/10 hover:text-text-primary transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
