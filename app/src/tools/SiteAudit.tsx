import { useState, useContext, useMemo } from 'react';
import { 
  Search, RefreshCw, Download, ExternalLink, AlertTriangle, 
  CheckCircle, Info, FileText, Image, Link2, Zap, Lock,
  ChevronDown, ChevronUp, BarChart3, Copy
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { AuditContext } from '@/contexts/app-context';
import { performSEOAudit } from '@/utils/seoAnalyzer';
import type { SEOAuditResult, SEOIssue } from '@/types';

const categoryIcons: Record<string, React.ElementType> = {
  meta: FileText,
  headings: BarChart3,
  images: Image,
  links: Link2,
  performance: Zap,
  security: Lock,
};

const severityColors = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-text-secondary bg-white/5 border-white/10',
};

type SuggestionImpact = 'High' | 'Medium' | 'Low';

interface AISuggestion {
  explanation: string;
  suggestedFix: string;
  impact: SuggestionImpact;
}

const impactRank: Record<SuggestionImpact, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const severityRank: Record<SEOIssue['severity'], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function getAISuggestionForIssue(issue: SEOIssue): AISuggestion {
  const title = issue.title.toLowerCase();

  if (title.includes('missing meta description')) {
    return {
      explanation: 'Missing meta descriptions reduce relevance signals and often lower click-through rate from SERPs.',
      suggestedFix:
        'Add a unique meta description between 140-160 characters.\nTemplate: "Learn [primary topic] with clear steps, examples, and practical takeaways. See how [benefit] today."',
      impact: 'High',
    };
  }

  if (title.includes('title tag too long')) {
    return {
      explanation: 'Overlong title tags are frequently truncated, which weakens keyword clarity and click motivation.',
      suggestedFix:
        'Rewrite title to 50-60 characters and lead with the primary keyword.\nTemplate: "[Primary Keyword] | [Main Benefit] in [Year]"',
      impact: 'Medium',
    };
  }

  if (title.includes('title too short')) {
    return {
      explanation: 'Short titles miss opportunities to communicate relevance and value to searchers.',
      suggestedFix:
        'Expand title with intent and value while staying below 60 characters.\nTemplate: "[Primary Keyword]: [Specific Value Proposition]"',
      impact: 'Medium',
    };
  }

  if (title.includes('missing h1')) {
    return {
      explanation: 'A missing H1 weakens topical focus for both search engines and users.',
      suggestedFix:
        'Add one descriptive H1 aligned with the primary keyword.\nTemplate: "<h1>[Primary Topic] for [Target Audience]</h1>"',
      impact: 'High',
    };
  }

  if (title.includes('multiple h1') || title.includes('too many h2')) {
    return {
      explanation: 'Heading overuse or inconsistent hierarchy creates ambiguity in page structure.',
      suggestedFix:
        'Keep exactly one H1 and group sections under logical H2/H3 headings.\nTemplate:\nH1: Primary topic\nH2: Core section 1\nH2: Core section 2\nH3: Supporting subsection',
      impact: 'Medium',
    };
  }

  if (title.includes('thin content')) {
    return {
      explanation: 'Thin pages underperform because they fail to satisfy query depth and intent.',
      suggestedFix:
        'Expand content with concrete examples, FAQs, and actionable steps.\nTarget: 700+ words for informational pages and strong internal linking to related content.',
      impact: 'High',
    };
  }

  if (title.includes('alt text') || title.includes('missing alt tags')) {
    return {
      explanation: 'Missing alt text reduces accessibility and loses image search relevance.',
      suggestedFix:
        'Add concise descriptive alt attributes to meaningful images.\nTemplate: alt="[Image subject] showing [context/action]"',
      impact: 'High',
    };
  }

  if (title.includes('broken internal links')) {
    return {
      explanation: 'Broken internal links waste crawl equity and create poor user experience.',
      suggestedFix:
        'Fix or redirect broken links, then re-crawl the page.\nChecklist: update href targets, replace removed URLs, and remove dead navigation references.',
      impact: 'High',
    };
  }

  if (title.includes('slow page load') || title.includes('render-blocking') || title.includes('browser caching')) {
    return {
      explanation: 'Performance bottlenecks directly impact rankings, user engagement, and conversion.',
      suggestedFix:
        'Compress images, defer non-critical JS, inline critical CSS, and enable long-cache headers for static assets.',
      impact: 'High',
    };
  }

  if (title.includes('https') || title.includes('security')) {
    return {
      explanation: 'Security gaps reduce trust and can negatively affect visibility and crawlability.',
      suggestedFix:
        'Force HTTPS, add HSTS, and configure CSP/X-Frame-Options/X-Content-Type-Options headers.',
      impact: 'Medium',
    };
  }

  if (issue.category === 'meta') {
    return {
      explanation: 'Meta layer issues affect how pages are understood and clicked in search results.',
      suggestedFix:
        'Align title/meta with search intent, include a primary keyword naturally, and keep snippets concise.',
      impact: 'Medium',
    };
  }

  if (issue.category === 'headings') {
    return {
      explanation: 'Heading structure provides semantic context for crawlers and scannability for users.',
      suggestedFix:
        'Use one H1 and a clear H2/H3 hierarchy that mirrors topic clusters and user journey.',
      impact: 'Medium',
    };
  }

  if (issue.category === 'performance') {
    return {
      explanation: 'Performance issues lower UX quality and can suppress ranking potential.',
      suggestedFix:
        'Audit Core Web Vitals, optimize media payloads, and eliminate unnecessary client-side scripts.',
      impact: 'High',
    };
  }

  return {
    explanation: 'Addressing this issue helps improve relevance, usability, and crawl efficiency.',
    suggestedFix:
      'Resolve the issue using SEO best practices, then re-audit the page to confirm impact.',
    impact: issue.severity === 'high' ? 'High' : issue.severity === 'medium' ? 'Medium' : 'Low',
  };
}

export default function SiteAudit() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SEOAuditResult | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [copiedSuggestionId, setCopiedSuggestionId] = useState<string | null>(null);
  const { setLastAudit, addToHistory } = useContext(AuditContext);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const auditResult = await performSEOAudit(url);
      setResult(auditResult);
      setLastAudit(auditResult);
      addToHistory(auditResult);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIssue = (id: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIssues(newExpanded);
  };

  const filteredIssues = result?.issues.filter(issue => 
    filter === 'all' || issue.severity === filter
  ) || [];

  const aiSuggestions = useMemo(() => {
    if (!result) return [];
    return result.issues.map((issue) => ({
      issue,
      ...getAISuggestionForIssue(issue),
    }));
  }, [result]);

  const priorityFixPlan = useMemo(() => {
    return [...aiSuggestions]
      .sort(
        (a, b) =>
          impactRank[b.impact] - impactRank[a.impact] ||
          severityRank[b.issue.severity] - severityRank[a.issue.severity],
      )
      .slice(0, 5);
  }, [aiSuggestions]);

  const handleCopyFix = async (issueId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSuggestionId(issueId);
      window.setTimeout(() => {
        setCopiedSuggestionId((current) => (current === issueId ? null : current));
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-lime';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-lime/20';
    if (score >= 75) return 'bg-yellow-500/20';
    if (score >= 50) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <Layout title="Site Audit">
      <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleAudit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
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
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Audit
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-dark-light border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBg(result.score)}`}>
                  <span className={`text-3xl font-display font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">SEO Score</p>
                  <p className="text-text-primary font-semibold capitalize">{result.status}</p>
                </div>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Pages Crawled</p>
                  <p className="text-text-primary font-semibold text-xl">{result.pageCount}</p>
                </div>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Load Time</p>
                  <p className="text-text-primary font-semibold text-xl">{result.loadTime}s</p>
                </div>
              </div>

              <div className="bg-dark-light border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Issues Found</p>
                  <p className="text-text-primary font-semibold text-xl">{result.issues.length}</p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-2xl font-display font-bold text-lime">+{result.metrics.organicTraffic}%</p>
                  <p className="text-text-secondary text-sm">Organic Traffic</p>
                </div>
                <div className="text-center p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-2xl font-display font-bold text-blue-400">{result.metrics.keywordRankings}</p>
                  <p className="text-text-secondary text-sm">Keywords Tracked</p>
                </div>
                <div className="text-center p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-2xl font-display font-bold text-purple-400">{result.metrics.clickThroughRate}%</p>
                  <p className="text-text-secondary text-sm">Click-Through Rate</p>
                </div>
                <div className="text-center p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-2xl font-display font-bold text-orange-400">{result.metrics.conversionRate}%</p>
                  <p className="text-text-secondary text-sm">Conversion Rate</p>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Issues Found</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter Buttons */}
                  <div className="flex bg-white/5 rounded-lg p-1">
                    {(['all', 'high', 'medium', 'low'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                          filter === f 
                            ? 'bg-lime text-dark font-medium' 
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button className="btn-outline text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Issue Summary */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-text-secondary text-sm">
                    {result.issues.filter(i => i.severity === 'high').length} High
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-text-secondary text-sm">
                    {result.issues.filter(i => i.severity === 'medium').length} Medium
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-text-secondary" />
                  <span className="text-text-secondary text-sm">
                    {result.issues.filter(i => i.severity === 'low').length} Low
                  </span>
                </div>
              </div>

              {/* Issues */}
              <div className="space-y-3">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-lime mx-auto mb-3" />
                    <p className="text-text-primary font-medium">No issues found!</p>
                    <p className="text-text-secondary text-sm">Great job on your SEO.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const Icon = categoryIcons[issue.category] || Info;
                    const isExpanded = expandedIssues.has(issue.id);
                    
                    return (
                      <div
                        key={issue.id}
                        className="border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                      >
                        <button
                          onClick={() => toggleIssue(issue.id)}
                          className="w-full flex items-start gap-4 p-4 text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-text-secondary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-text-primary font-medium">{issue.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${severityColors[issue.severity]}`}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-text-secondary text-sm line-clamp-2">{issue.description}</p>
                          </div>
                          
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-text-secondary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 pl-[72px]">
                            <div className="bg-white/[0.03] rounded-lg p-4">
                              <p className="text-text-secondary text-sm mb-3">{issue.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-text-secondary text-xs">Category:</span>
                                <span className="text-text-primary text-xs capitalize">{issue.category}</span>
                              </div>
                              <button className="text-lime text-sm mt-3 flex items-center gap-1 hover:underline">
                                Learn how to fix
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">AI Suggestions</h3>
              <div className="space-y-4">
                {aiSuggestions.map(({ issue, explanation, suggestedFix, impact }) => (
                  <div key={`ai-${issue.id}`} className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-text-primary font-medium">{issue.title}</p>
                        <p className="text-xs text-text-secondary mt-1">Impact: {impact}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyFix(issue.id, suggestedFix)}
                        className="btn-outline text-sm px-3 py-2 inline-flex items-center gap-2 w-fit"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedSuggestionId === issue.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-text-secondary text-sm mb-3">{explanation}</p>
                    <div className="bg-dark/50 border border-white/5 rounded-lg p-3">
                      <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">Suggested fix</p>
                      <pre className="whitespace-pre-wrap text-text-primary text-sm font-body">{suggestedFix}</pre>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <h4 className="text-base font-semibold text-text-primary mb-3">Priority Fix Plan</h4>
                <div className="space-y-2">
                  {priorityFixPlan.map(({ issue, impact }) => (
                    <div
                      key={`plan-${issue.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <p className="text-text-primary text-sm">{issue.title}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full w-fit ${
                          impact === 'High'
                            ? 'bg-red-500/10 text-red-300'
                            : impact === 'Medium'
                              ? 'bg-yellow-500/10 text-yellow-300'
                              : 'bg-white/10 text-text-secondary'
                        }`}
                      >
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Start Your First Audit</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Enter your website URL above to run a comprehensive SEO audit. 
              We'll analyze 50+ factors and provide actionable recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lime" />
                Meta tags
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lime" />
                Headings
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lime" />
                Images
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lime" />
                Links
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lime" />
                Performance
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
