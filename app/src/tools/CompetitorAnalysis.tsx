import { useState } from 'react';
import { 
  Users, TrendingUp, Link2, Target, BarChart3,
  Download, ExternalLink,
  Plus, X, Trophy
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { getCompetitorData } from '@/utils/seoAnalyzer';
import type { CompetitorData } from '@/types';

export default function CompetitorAnalysis() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const results = await getCompetitorData(url);
      setCompetitors(results);
    } catch (error) {
      console.error('Competitor analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompetitor = () => {
    if (!newCompetitor) return;
    
    const newComp: CompetitorData = {
      domain: newCompetitor,
      score: 50 + Math.floor(Math.random() * 40),
      keywords: 500 + Math.floor(Math.random() * 3000),
      backlinks: 1000 + Math.floor(Math.random() * 10000),
      traffic: 5000 + Math.floor(Math.random() * 50000),
      topKeywords: ['keyword1', 'keyword2', 'keyword3'],
    };
    
    setCompetitors([...competitors, newComp].sort((a, b) => b.score - a.score));
    setNewCompetitor('');
    setShowAddModal(false);
  };

  const removeCompetitor = (domain: string) => {
    setCompetitors(competitors.filter(c => c.domain !== domain));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-lime';
    if (rank === 2) return 'text-yellow-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-text-secondary';
  };

  return (
    <Layout title="Competitor Analysis">
      <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your website URL"
                className="input-dark w-full pl-12"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-lime flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Compare
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {competitors.length > 0 && (
          <>
            {/* Comparison Table */}
            <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-text-primary">Competitor Comparison</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-outline text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Competitor
                  </button>
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
                      <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Rank</th>
                      <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Domain</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">SEO Score</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Keywords</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Backlinks</th>
                      <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Traffic</th>
                      <th className="text-center text-text-secondary text-sm font-medium px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((competitor, index) => (
                      <tr 
                        key={competitor.domain} 
                        className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors ${
                          competitor.isYou ? 'bg-lime/5' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Trophy className="w-5 h-5 text-yellow-400" />}
                            <span className={`font-display font-bold ${getRankColor(index + 1)}`}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary font-medium">{competitor.domain}</span>
                            {competitor.isYou && (
                              <span className="px-2 py-0.5 bg-lime/20 text-lime text-xs rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-display font-bold ${
                            competitor.score >= 80 ? 'text-lime' :
                            competitor.score >= 60 ? 'text-yellow-400' : 'text-orange-400'
                          }`}>
                            {competitor.score}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-text-primary">{formatNumber(competitor.keywords)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-text-primary">{formatNumber(competitor.backlinks)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-text-primary">{formatNumber(competitor.traffic)}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`https://${competitor.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-text-secondary" />
                            </a>
                            {!competitor.isYou && (
                              <button
                                onClick={() => removeCompetitor(competitor.domain)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Comparison */}
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <h4 className="text-text-primary font-medium mb-4">SEO Score Comparison</h4>
                <div className="space-y-4">
                  {competitors.map((competitor) => (
                    <div key={competitor.domain}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm ${competitor.isYou ? 'text-lime font-medium' : 'text-text-secondary'}`}>
                          {competitor.domain}
                        </span>
                        <span className="text-text-primary font-medium">{competitor.score}</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            competitor.isYou ? 'bg-lime' : 'bg-text-secondary'
                          }`}
                          style={{ width: `${competitor.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Comparison */}
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <h4 className="text-text-primary font-medium mb-4">Traffic Comparison</h4>
                <div className="space-y-4">
                  {competitors.map((competitor) => {
                    const maxTraffic = Math.max(...competitors.map(c => c.traffic));
                    return (
                      <div key={competitor.domain}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${competitor.isYou ? 'text-lime font-medium' : 'text-text-secondary'}`}>
                            {competitor.domain}
                          </span>
                          <span className="text-text-primary font-medium">{formatNumber(competitor.traffic)}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              competitor.isYou ? 'bg-blue-400' : 'bg-text-secondary'
                            }`}
                            style={{ width: `${(competitor.traffic / maxTraffic) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
              <h4 className="text-text-primary font-medium mb-4">Key Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-lime" />
                    <span className="text-text-secondary text-sm">Opportunity</span>
                  </div>
                  <p className="text-text-primary text-sm">
                    Top competitor ranks for {formatNumber(competitors[0]?.keywords || 0)} keywords. 
                    Consider targeting their top performing keywords.
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-5 h-5 text-blue-400" />
                    <span className="text-text-secondary text-sm">Backlink Gap</span>
                  </div>
                  <p className="text-text-primary text-sm">
                    Leading competitor has {formatNumber((competitors[0]?.backlinks || 0) - (competitors.find(c => c.isYou)?.backlinks || 0))} more backlinks. 
                    Focus on link building.
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <span className="text-text-secondary text-sm">Traffic Potential</span>
                  </div>
                  <p className="text-text-primary text-sm">
                    Market leader gets {formatNumber(competitors[0]?.traffic || 0)} visits/month. 
                    Significant growth opportunity exists.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {competitors.length === 0 && !isLoading && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Compare with Competitors</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Enter your website URL to see how you stack up against your competitors 
              in terms of SEO score, keywords, backlinks, and traffic.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['yourdomain.com', 'example.com'].map((example) => (
                <button
                  key={example}
                  onClick={() => setUrl(`https://${example}`)}
                  className="px-4 py-2 bg-white/5 rounded-lg text-text-secondary text-sm hover:bg-white/10 hover:text-text-primary transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Competitor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative bg-dark-light border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Add Competitor</h3>
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                placeholder="Enter competitor domain"
                className="input-dark w-full mb-4"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddCompetitor}
                  className="btn-lime flex-1"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
