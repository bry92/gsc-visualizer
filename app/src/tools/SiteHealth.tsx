import { useState, useEffect } from 'react';
import { 
  Activity, Globe, Smartphone, Clock, AlertTriangle,
  CheckCircle, XCircle, Zap, Server, Lock
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { getSiteHealthData } from '@/utils/seoAnalyzer';
import type { SiteHealthData } from '@/types';

export default function SiteHealth() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SiteHealthData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const result = await getSiteHealthData(url);
      setData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Site health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!url) return;
    
    const interval = setInterval(() => {
      handleCheck({ preventDefault: () => {} } as React.FormEvent);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [url]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-lime';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getVitalStatus = (value: number, threshold: number, lowerIsBetter = false) => {
    if (lowerIsBetter) {
      return value <= threshold ? { icon: CheckCircle, color: 'text-lime', bg: 'bg-lime/10' } : 
             { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    }
    return value >= threshold ? { icon: CheckCircle, color: 'text-lime', bg: 'bg-lime/10' } : 
           { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  };

  return (
    <Layout title="Site Health">
      <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL"
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
                  Checking...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Check Health
                </>
              )}
            </button>
          </form>
          
          {lastUpdated && (
            <p className="text-text-secondary text-sm mt-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Results */}
        {data && (
          <>
            {/* Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">Health Score</span>
                  <Activity className="w-5 h-5 text-lime" />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-display font-bold ${getHealthColor(data.overallHealth)}`}>
                    {data.overallHealth}
                  </span>
                  <span className="text-text-secondary text-sm mb-1">/100</span>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      data.overallHealth >= 80 ? 'bg-lime' :
                      data.overallHealth >= 60 ? 'bg-yellow-400' :
                      data.overallHealth >= 40 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${data.overallHealth}%` }}
                  />
                </div>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">Uptime</span>
                  <Server className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-display font-bold text-text-primary">
                    {data.uptime.toFixed(2)}%
                  </span>
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  {data.uptime >= 99.9 ? 'Excellent' : data.uptime >= 99 ? 'Good' : 'Needs attention'}
                </p>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">Load Time</span>
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-display font-bold text-text-primary">
                    {data.avgLoadTime}
                  </span>
                  <span className="text-text-secondary text-sm mb-1">s</span>
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  {parseFloat(data.avgLoadTime) < 2 ? 'Fast' : parseFloat(data.avgLoadTime) < 4 ? 'Average' : 'Slow'}
                </p>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary text-sm">SSL Status</span>
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center gap-2">
                  {data.sslValid ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-lime" />
                      <span className="text-lime font-medium">Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-red-400 font-medium">Invalid</span>
                    </>
                  )}
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  Expires: {data.sslExpiry}
                </p>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Core Web Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* LCP */}
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-secondary text-sm">Largest Contentful Paint (LCP)</span>
                    {(() => {
                      const status = getVitalStatus(parseFloat(data.coreWebVitals.lcp), 2.5, true);
                      const Icon = status.icon;
                      return <Icon className={`w-5 h-5 ${status.color}`} />;
                    })()}
                  </div>
                  <p className="text-2xl font-display font-bold text-text-primary">{data.coreWebVitals.lcp}s</p>
                  <p className="text-text-secondary text-xs mt-1">Target: &lt; 2.5s</p>
                </div>

                {/* FID */}
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-secondary text-sm">First Input Delay (FID)</span>
                    {(() => {
                      const status = getVitalStatus(data.coreWebVitals.fid, 100, true);
                      const Icon = status.icon;
                      return <Icon className={`w-5 h-5 ${status.color}`} />;
                    })()}
                  </div>
                  <p className="text-2xl font-display font-bold text-text-primary">{data.coreWebVitals.fid}ms</p>
                  <p className="text-text-secondary text-xs mt-1">Target: &lt; 100ms</p>
                </div>

                {/* CLS */}
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-secondary text-sm">Cumulative Layout Shift (CLS)</span>
                    {(() => {
                      const status = getVitalStatus(parseFloat(data.coreWebVitals.cls), 0.1, true);
                      const Icon = status.icon;
                      return <Icon className={`w-5 h-5 ${status.color}`} />;
                    })()}
                  </div>
                  <p className="text-2xl font-display font-bold text-text-primary">{data.coreWebVitals.cls}</p>
                  <p className="text-text-secondary text-xs mt-1">Target: &lt; 0.1</p>
                </div>
              </div>
            </div>

            {/* Crawl Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Crawl Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                    <span className="text-text-secondary">Pages Crawled</span>
                    <span className="text-text-primary font-semibold">{data.crawlStats.pagesCrawled.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                    <span className="text-text-secondary">Pages Indexed</span>
                    <span className="text-text-primary font-semibold">{data.crawlStats.pagesIndexed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                    <span className="text-text-secondary">Crawl Errors</span>
                    <span className={`font-semibold ${data.crawlStats.crawlErrors > 0 ? 'text-red-400' : 'text-text-primary'}`}>
                      {data.crawlStats.crawlErrors}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                    <span className="text-text-secondary">Blocked by Robots</span>
                    <span className="text-text-primary font-semibold">{data.crawlStats.blockedByRobots}</span>
                  </div>
                </div>
              </div>

              {/* Issues Summary */}
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Issues Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div className="flex-1">
                      <span className="text-text-secondary text-sm">Critical Issues</span>
                      <p className="text-2xl font-display font-bold text-red-400">{data.issues.critical}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-yellow-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    <div className="flex-1">
                      <span className="text-text-secondary text-sm">Warnings</span>
                      <p className="text-2xl font-display font-bold text-yellow-400">{data.issues.warnings}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-text-secondary" />
                    <div className="flex-1">
                      <span className="text-text-secondary text-sm">Notices</span>
                      <p className="text-2xl font-display font-bold text-text-secondary">{data.issues.notices}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Friendly */}
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    data.mobileFriendly ? 'bg-lime/10' : 'bg-red-500/10'
                  }`}>
                    <Smartphone className={`w-6 h-6 ${data.mobileFriendly ? 'text-lime' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Mobile Friendliness</h3>
                    <p className="text-text-secondary text-sm">
                      {data.mobileFriendly 
                        ? 'Your site is mobile-friendly and responsive' 
                        : 'Your site has mobile usability issues'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  data.mobileFriendly ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'
                }`}>
                  {data.mobileFriendly ? 'Mobile Friendly' : 'Issues Found'}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!data && !isLoading && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Check Your Site Health</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Monitor your website's performance, Core Web Vitals, SSL status, 
              and crawl statistics in real-time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['example.com', 'yourdomain.com'].map((example) => (
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
    </Layout>
  );
}
