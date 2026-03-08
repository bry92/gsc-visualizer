import { useContext, useState } from 'react';
import { 
  Link2, Globe, ArrowUpRight, 
  ExternalLink, TrendingUp, TrendingDown,
  Shield, Target, BarChart3
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ProGate from '@/components/ProGate';
import { AuthContext } from '@/contexts/app-context';
import { getBacklinkData } from '@/utils/seoAnalyzer';
import type { BacklinkData } from '@/types';

export default function BacklinkAnalyzer() {
  const { isPro } = useContext(AuthContext);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BacklinkData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'anchors'>('overview');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const result = await getBacklinkData(url);
      setData(result);
    } catch (error) {
      console.error('Backlink analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Layout title="Backlink Analyzer">
      <ProGate isPro={isPro}>
        <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {data && (
          <>
            {/* Authority Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">Domain Authority</span>
                  <Shield className="w-5 h-5 text-lime" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-display font-bold text-text-primary">{data.domainAuthority}</span>
                  <span className="text-text-secondary text-sm mb-1">/100</span>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-lime rounded-full transition-all duration-500"
                    style={{ width: `${data.domainAuthority}%` }}
                  />
                </div>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">Page Authority</span>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-display font-bold text-text-primary">{data.pageAuthority}</span>
                  <span className="text-text-secondary text-sm mb-1">/100</span>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${data.pageAuthority}%` }}
                  />
                </div>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">Backlink Growth</span>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-lime" />
                      <span className="text-lime font-semibold">+{formatNumber(data.newBacklinks)}</span>
                    </div>
                    <span className="text-text-secondary text-xs">New (30 days)</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-semibold">-{formatNumber(data.lostBacklinks)}</span>
                    </div>
                    <span className="text-text-secondary text-xs">Lost (30 days)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backlink Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-text-primary">{formatNumber(data.totalBacklinks)}</p>
                <p className="text-text-secondary text-sm">Total Backlinks</p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-text-primary">{formatNumber(data.referringDomains)}</p>
                <p className="text-text-secondary text-sm">Referring Domains</p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-lime">{formatNumber(data.followLinks)}</p>
                <p className="text-text-secondary text-sm">Dofollow Links</p>
              </div>
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-text-secondary">{formatNumber(data.nofollowLinks)}</p>
                <p className="text-text-secondary text-sm">Nofollow Links</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/5">
                {(['overview', 'domains', 'anchors'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-lime border-b-2 border-lime'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Link Type Distribution */}
                    <div>
                      <h4 className="text-text-primary font-medium mb-4">Link Type Distribution</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-lime"
                            style={{ width: `${(data.followLinks / data.totalBacklinks) * 100}%` }}
                          />
                          <div 
                            className="h-full bg-text-secondary"
                            style={{ width: `${(data.nofollowLinks / data.totalBacklinks) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-lime" />
                          <span className="text-text-secondary text-sm">
                            Dofollow ({((data.followLinks / data.totalBacklinks) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-text-secondary" />
                          <span className="text-text-secondary text-sm">
                            Nofollow ({((data.nofollowLinks / data.totalBacklinks) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] rounded-xl p-4">
                        <p className="text-text-secondary text-sm mb-1">Backlinks per Domain</p>
                        <p className="text-2xl font-display font-bold text-text-primary">
                          {(data.totalBacklinks / data.referringDomains).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-4">
                        <p className="text-text-secondary text-sm mb-1">Authority Trend</p>
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-5 h-5 text-lime" />
                          <span className="text-lime font-semibold">+2.4%</span>
                          <span className="text-text-secondary text-sm">vs last month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'domains' && (
                  <div>
                    <h4 className="text-text-primary font-medium mb-4">Top Referring Domains</h4>
                    <div className="space-y-3">
                      {data.topReferringDomains.map((domain, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-lime/10 rounded-lg flex items-center justify-center text-lime font-semibold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-text-primary font-medium">{domain.domain}</p>
                              <p className="text-text-secondary text-sm">{formatNumber(domain.backlinks)} backlinks</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-text-secondary text-sm">Authority</p>
                              <p className="text-text-primary font-semibold">{domain.authority}</p>
                            </div>
                            <a
                              href={`https://${domain.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-text-secondary" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'anchors' && (
                  <div>
                    <h4 className="text-text-primary font-medium mb-4">Top Anchor Texts</h4>
                    <div className="space-y-3">
                      {data.anchorTexts.map((anchor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-lime/10 rounded-lg flex items-center justify-center text-lime font-semibold">
                              {index + 1}
                            </span>
                            <p className="text-text-primary font-medium">"{anchor.text}"</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-text-secondary text-sm">Count</p>
                              <p className="text-text-primary font-semibold">{formatNumber(anchor.count)}</p>
                            </div>
                            <div className="w-24">
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-lime rounded-full"
                                  style={{ width: `${(anchor.count / data.anchorTexts[0].count) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!data && !isLoading && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Link2 className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Analyze Your Backlink Profile</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Enter your website URL to discover your backlink profile, 
              domain authority, and top referring domains.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['example.com', 'yourdomain.com', 'competitor.com'].map((example) => (
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
        </div>
      </ProGate>
    </Layout>
  );
}
