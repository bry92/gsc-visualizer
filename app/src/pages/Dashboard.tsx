import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, TrendingUp, Link2, Users, Activity, 
  ArrowUpRight, ArrowDownRight, Clock, Globe,
  Zap, AlertCircle, CheckCircle, BarChart3
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { AuditContext } from '@/contexts/app-context';
import { getSiteHealthData } from '@/utils/seoAnalyzer';
import type { SiteHealthData } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'lime' | 'blue' | 'purple' | 'orange';
}

function StatCard({ title, value, change, icon: Icon, trend = 'neutral', color = 'lime' }: StatCardProps) {
  const colorClasses = {
    lime: 'bg-lime/10 text-lime border-lime/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <div className="bg-dark-light border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-lime' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
             trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <h3 className="text-text-secondary text-sm mb-1">{title}</h3>
      <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
    </div>
  );
}

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  color: string;
}

function ToolCard({ title, description, icon: Icon, to, color }: ToolCardProps) {
  return (
    <Link 
      to={to}
      className="group bg-dark-light border border-white/5 rounded-2xl p-6 hover:border-white/15 transition-all hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-lime transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary text-sm">{description}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { lastAudit, auditHistory } = useContext(AuditContext);
  const [siteHealth, setSiteHealth] = useState<SiteHealthData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const health = await getSiteHealthData('example.com');
        setSiteHealth(health);
      } catch (error) {
        console.error('Error fetching site health:', error);
      }
    };
    fetchData();
  }, []);

  const tools = [
    {
      title: 'Site Audit',
      description: 'Comprehensive SEO analysis of your website',
      icon: Search,
      to: '/tools/audit',
      color: 'bg-lime/10 text-lime',
    },
    {
      title: 'Keyword Research',
      description: 'Find high-value keywords for your content',
      icon: TrendingUp,
      to: '/tools/keywords',
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      title: 'Backlink Analyzer',
      description: 'Analyze your backlink profile and authority',
      icon: Link2,
      to: '/tools/backlinks',
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      title: 'Competitor Analysis',
      description: 'Compare your site with competitors',
      icon: Users,
      to: '/tools/competitors',
      color: 'bg-orange-500/10 text-orange-400',
    },
    {
      title: 'Rank Tracker',
      description: 'Monitor your keyword rankings over time',
      icon: BarChart3,
      to: '/tools/rank-tracker',
      color: 'bg-pink-500/10 text-pink-400',
    },
    {
      title: 'Site Health',
      description: 'Monitor site performance and issues',
      icon: Activity,
      to: '/tools/site-health',
      color: 'bg-cyan-500/10 text-cyan-400',
    },
    {
      title: 'GSC Data Visualizer',
      description: 'Upload GSC exports and visualize clicks, impressions, CTR, and position',
      icon: Globe,
      to: '/tools/gsc-visualizer',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Intent Reshaper',
      description: 'Detect intent drift and reshape content to hold CTR',
      icon: AlertCircle,
      to: '/tools/intent-reshaper',
      color: 'bg-amber-500/10 text-amber-400',
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-1">
              Welcome back!
            </h2>
            <p className="text-text-secondary">
              Here's what's happening with your SEO performance
            </p>
          </div>
          <Link 
            to="/tools/audit"
            className="btn-lime inline-flex items-center justify-center gap-2 w-fit"
          >
            <Search className="w-4 h-4" />
            Run New Audit
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="SEO Score"
            value={lastAudit?.score || 84}
            change={5}
            icon={Zap}
            trend="up"
            color="lime"
          />
          <StatCard 
            title="Organic Traffic"
            value={`+${lastAudit?.metrics?.organicTraffic || 34}%`}
            change={12}
            icon={TrendingUp}
            trend="up"
            color="blue"
          />
          <StatCard 
            title="Backlinks"
            value="1,247"
            change={8}
            icon={Link2}
            trend="up"
            color="purple"
          />
          <StatCard 
            title="Keywords Tracked"
            value={lastAudit?.metrics?.keywordRankings || 156}
            change={-2}
            icon={Activity}
            trend="down"
            color="orange"
          />
        </div>

        {/* Site Health Overview */}
        {siteHealth && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Site Health Overview</h3>
              <Link to="/tools/site-health" className="text-lime text-sm hover:underline">
                View Details
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  siteHealth.overallHealth >= 80 ? 'bg-lime/20' : 
                  siteHealth.overallHealth >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  <span className={`text-2xl font-display font-bold ${
                    siteHealth.overallHealth >= 80 ? 'text-lime' : 
                    siteHealth.overallHealth >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {siteHealth.overallHealth}
                  </span>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Health Score</p>
                  <p className="text-text-primary font-medium">
                    {siteHealth.overallHealth >= 80 ? 'Excellent' : 
                     siteHealth.overallHealth >= 60 ? 'Good' : 'Needs Attention'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Globe className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Uptime</p>
                  <p className="text-text-primary font-medium">{siteHealth.uptime.toFixed(2)}%</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Avg Load Time</p>
                  <p className="text-text-primary font-medium">{siteHealth.avgLoadTime}s</p>
                </div>
              </div>
            </div>

            {/* Issues Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">{siteHealth.issues.critical}</p>
                  <p className="text-text-secondary text-sm">Critical</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">{siteHealth.issues.warnings}</p>
                  <p className="text-text-secondary text-sm">Warnings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">{siteHealth.issues.notices}</p>
                  <p className="text-text-secondary text-sm">Notices</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Tools */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">SEO Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {auditHistory.length > 0 && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Audits</h3>
            <div className="space-y-3">
              {auditHistory.slice(0, 5).map((audit, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      audit.score >= 80 ? 'bg-lime/10' : 
                      audit.score >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    }`}>
                      <span className={`font-display font-bold ${
                        audit.score >= 80 ? 'text-lime' : 
                        audit.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {audit.score}
                      </span>
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">{audit.url}</p>
                      <p className="text-text-secondary text-sm">
                        {new Date(audit.crawledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-text-secondary text-sm">
                    {audit.issues.length} issues found
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
