import { useState } from 'react';
import { 
  Search, TrendingUp, TrendingDown, Minus, Download, 
  Copy, Check, BarChart3, DollarSign, Target,
  ArrowUpRight, Filter
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { getKeywordSuggestions } from '@/utils/seoAnalyzer';
import type { KeywordSuggestion } from '@/types';

export default function KeywordResearch() {
  const [seed, setSeed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<KeywordSuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'volume' | 'difficulty' | 'cpc'>('volume');
  const sortOptions: Array<'volume' | 'difficulty' | 'cpc'> = ['volume', 'difficulty', 'cpc'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed) return;

    setIsLoading(true);
    try {
      const results = await getKeywordSuggestions(seed);
      setKeywords(results);
    } catch (error) {
      console.error('Keyword search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyKeyword = (keyword: string, index: number) => {
    navigator.clipboard.writeText(keyword);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (sortBy === 'volume') return b.volume - a.volume;
    if (sortBy === 'difficulty') return b.difficulty - a.difficulty;
    return b.cpc - a.cpc;
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-lime';
    if (difficulty < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend || trend === 0) return <Minus className="w-4 h-4 text-text-secondary" />;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-lime" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Layout title="Keyword Research">
      <div className="space-y-6">
        {/* Search Section */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Enter a seed keyword (e.g., 'seo tools')"
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
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Keywords
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {keywords.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-lime" />
                  <span className="text-text-secondary text-sm">Avg Volume</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {formatNumber(Math.round(keywords.reduce((a, b) => a + b.volume, 0) / keywords.length))}
                </p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-text-secondary text-sm">Avg Difficulty</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {Math.round(keywords.reduce((a, b) => a + b.difficulty, 0) / keywords.length)}
                </p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-text-secondary text-sm">Avg CPC</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  ${(keywords.reduce((a, b) => a + b.cpc, 0) / keywords.length).toFixed(2)}
                </p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-purple-400" />
                  <span className="text-text-secondary text-sm">Keywords</span>
                </div>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {keywords.length}
                </p>
              </div>
            </div>

            {/* Keywords Table */}
            <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-text-primary">Keyword Suggestions</h3>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary text-sm">Sort by:</span>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const value = e.target.value as 'volume' | 'difficulty' | 'cpc';
                      if (sortOptions.includes(value)) {
                        setSortBy(value);
                      }
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-lime/50"
                  >
                    <option value="volume">Volume</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="cpc">CPC</option>
                  </select>
                  
                  <button className="btn-outline text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Keyword</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Volume</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Difficulty</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">CPC</th>
                      <th className="text-center text-text-secondary text-sm font-medium px-4 py-3">Trend</th>
                      <th className="text-center text-text-secondary text-sm font-medium px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedKeywords.map((keyword, index) => (
                      <tr key={index} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-text-primary font-medium">{keyword.keyword}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary">{formatNumber(keyword.volume)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={getDifficultyColor(keyword.difficulty)}>
                              {keyword.difficulty}
                            </span>
                            <span className="text-text-secondary text-xs">
                              ({getDifficultyLabel(keyword.difficulty)})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary">${keyword.cpc.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center">
                            {getTrendIcon(keyword.trend)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => copyKeyword(keyword.keyword, index)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Copy keyword"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-lime" />
                            ) : (
                              <Copy className="w-4 h-4 text-text-secondary" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {keywords.length === 0 && !isLoading && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Find High-Value Keywords</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Enter a seed keyword to discover related keywords with search volume, 
              difficulty scores, and CPC data.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['seo tools', 'digital marketing', 'content strategy', 'web analytics'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setSeed(example);
                  }}
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
