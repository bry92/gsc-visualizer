import { useContext, useMemo, useState } from 'react';
import { Database, Sparkles } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { GSCContext } from '@/contexts/app-context';
import {
  classifyQueryIntent,
  getSuggestedContentType,
  parseQueriesFromText,
} from '@/utils/gscData';

interface ClassifiedQuery {
  query: string;
  intent: ReturnType<typeof classifyQueryIntent>;
  contentType: string;
}

function intentBadgeClasses(intent: ClassifiedQuery['intent']): string {
  switch (intent) {
    case 'Transactional':
      return 'bg-red-500/10 text-red-300 border-red-500/30';
    case 'Commercial':
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    case 'Navigational':
      return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    default:
      return 'bg-lime/10 text-lime border-lime/30';
  }
}

export default function QueryIntentClassifier() {
  const { gscRows, gscSource } = useContext(GSCContext);
  const [queryInput, setQueryInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('Paste one query per line to classify search intent.');

  const results = useMemo<ClassifiedQuery[]>(() => {
    return parseQueriesFromText(queryInput).map((query) => {
      const intent = classifyQueryIntent(query);
      return {
        query,
        intent,
        contentType: getSuggestedContentType(intent),
      };
    });
  }, [queryInput]);

  const handleImportFromGsc = () => {
    if (!gscRows || gscRows.length === 0) {
      setStatusMessage('No GSC Visualizer session data found. Upload data in GSC Visualizer first.');
      return;
    }

    const uniqueQueries = Array.from(new Set(gscRows.map((row) => row.query).filter((query) => query.trim().length > 0)));
    setQueryInput(uniqueQueries.join('\n'));
    setStatusMessage(`Imported ${uniqueQueries.length} queries from ${gscSource || 'GSC session data'}.`);
  };

  return (
    <Layout title="Query Intent Classifier">
      <div className="space-y-6">
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Query Intent Classifier</h2>
          <p className="text-text-secondary mb-5">
            Classify search intent with deterministic rules and map each query to a recommended content type.
          </p>

          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <button type="button" className="btn-outline flex items-center justify-center gap-2" onClick={handleImportFromGsc}>
              <Database className="w-4 h-4" />
              Import Queries From GSC Visualizer
            </button>
          </div>

          <textarea
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Enter one query per line..."
            className="input-dark w-full min-h-[180px] resize-y"
          />

          <p className="text-sm text-text-secondary mt-3">{statusMessage}</p>
        </div>

        {results.length > 0 ? (
          <div className="bg-dark-light border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-text-secondary text-sm">
              <Sparkles className="w-4 h-4" />
              Classified {results.length} queries
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Query</th>
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Intent</th>
                    <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Suggested Content Type</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.query} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-primary">{result.query}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${intentBadgeClasses(result.intent)}`}>
                          {result.intent}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{result.contentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">No queries to classify yet</h3>
            <p className="text-text-secondary max-w-xl mx-auto">
              Paste queries in the textarea or import them from your GSC Visualizer session.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

