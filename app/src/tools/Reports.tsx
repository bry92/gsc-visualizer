import { useState, useContext } from 'react';
import { 
  FileText, Download, Calendar, Filter, Search, 
  Trash2, Eye, Share2,
  FileSpreadsheet, FileJson, FileCode
} from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { AuditContext } from '@/contexts/app-context';

interface Report {
  id: string;
  name: string;
  type: 'audit' | 'keyword' | 'backlink' | 'competitor' | 'comprehensive';
  createdAt: string;
  url?: string;
  format: 'pdf' | 'csv' | 'json';
  size: string;
}

type ReportType = Report['type'];
type ReportFormat = Report['format'];

export default function Reports() {
  const { auditHistory } = useContext(AuditContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly SEO Audit',
      type: 'comprehensive',
      createdAt: '2026-03-01T10:00:00Z',
      url: 'https://example.com',
      format: 'pdf',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Backlink Analysis Report',
      type: 'backlink',
      createdAt: '2026-02-28T14:30:00Z',
      url: 'https://example.com',
      format: 'csv',
      size: '156 KB',
    },
    {
      id: '3',
      name: 'Keyword Research Export',
      type: 'keyword',
      createdAt: '2026-02-25T09:15:00Z',
      format: 'csv',
      size: '89 KB',
    },
    {
      id: '4',
      name: 'Competitor Comparison',
      type: 'competitor',
      createdAt: '2026-02-20T16:45:00Z',
      format: 'pdf',
      size: '1.8 MB',
    },
  ]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  const deleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const generateReport = async (type: ReportType, format: ReportFormat) => {
    setGeneratingReport(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: Report = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type,
      createdAt: new Date().toISOString(),
      format,
      size: format === 'pdf' ? '2.1 MB' : format === 'csv' ? '145 KB' : '89 KB',
    };
    
    setReports([newReport, ...reports]);
    setGeneratingReport(false);
    setShowGenerateModal(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audit':
      case 'comprehensive':
        return <FileText className="w-5 h-5 text-lime" />;
      case 'keyword':
        return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
      case 'backlink':
        return <FileCode className="w-5 h-5 text-purple-400" />;
      case 'competitor':
        return <FileJson className="w-5 h-5 text-orange-400" />;
      default:
        return <FileText className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded">PDF</span>;
      case 'csv':
        return <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded">CSV</span>;
      case 'json':
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded">JSON</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Layout title="Reports">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">SEO Reports</h2>
            <p className="text-text-secondary text-sm">Generate, download, and manage your SEO reports</p>
          </div>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="btn-lime flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..."
                className="input-dark w-full pl-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-lime/50"
              >
                <option value="all">All Types</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="audit">Site Audit</option>
                <option value="keyword">Keyword</option>
                <option value="backlink">Backlink</option>
                <option value="competitor">Competitor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length > 0 ? (
          <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Report</th>
                    <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Type</th>
                    <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Date</th>
                    <th className="text-left text-text-secondary text-sm font-medium px-4 py-3">Format</th>
                    <th className="text-right text-text-secondary text-sm font-medium px-4 py-3">Size</th>
                    <th className="text-center text-text-secondary text-sm font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                            {getTypeIcon(report.type)}
                          </div>
                          <span className="text-text-primary font-medium">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-text-secondary text-sm capitalize">{report.type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(report.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getFormatIcon(report.format)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-text-secondary text-sm">{report.size}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button 
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button 
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button 
                            onClick={() => deleteReport(report.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Reports Yet</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Generate your first SEO report to analyze your website's performance 
              and track improvements over time.
            </p>
            <button 
              onClick={() => setShowGenerateModal(true)}
              className="btn-lime"
            >
              Generate First Report
            </button>
          </div>
        )}

        {/* Recent Audits Quick Export */}
        {auditHistory.length > 0 && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Audits - Quick Export</h3>
            <div className="space-y-3">
              {auditHistory.slice(0, 3).map((audit, index) => (
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
                        {new Date(audit.crawledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button className="btn-outline text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
              onClick={() => setShowGenerateModal(false)}
            />
            <div className="relative bg-dark-light border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Generate Report</h3>
              
              {generatingReport ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-lime/20 border-t-lime rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-primary">Generating your report...</p>
                  <p className="text-text-secondary text-sm">This may take a moment</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-text-secondary text-sm mb-2 block">Report Type</label>
                      <select 
                        id="reportType"
                        className="input-dark w-full"
                      >
                        <option value="comprehensive">Comprehensive SEO Report</option>
                        <option value="audit">Site Audit Report</option>
                        <option value="keyword">Keyword Research Report</option>
                        <option value="backlink">Backlink Analysis Report</option>
                        <option value="competitor">Competitor Analysis Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-text-secondary text-sm mb-2 block">Export Format</label>
                      <select 
                        id="reportFormat"
                        className="input-dark w-full"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="csv">CSV Spreadsheet</option>
                        <option value="json">JSON Data</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const type = (document.getElementById('reportType') as HTMLSelectElement).value as ReportType;
                        const format = (document.getElementById('reportFormat') as HTMLSelectElement).value as ReportFormat;
                        generateReport(type, format);
                      }}
                      className="btn-lime flex-1"
                    >
                      Generate
                    </button>
                    <button
                      onClick={() => setShowGenerateModal(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
