'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trophy } from 'lucide-react';

import { listLegalResearchMostCitedOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { PageHeader } from '@/components/layout/PageHeader';

import { CitationGraph } from '../components/CitationGraph';
import { DocumentPanel, type DocumentTarget } from '../components/DocumentPanel';

export default function MostCitedPage() {
  const [documentTarget, setDocumentTarget] = useState<DocumentTarget | null>(null);
  const [graphSeed, setGraphSeed] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    ...listLegalResearchMostCitedOptions({ query: { limit: 50 } }),
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        icon={<Trophy className="w-5 h-5" />}
        title="Most Cited Decisions"
        description="Decisions ranked by how often they are cited across the corpus."
      />

      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-muted-foreground text-center py-20">
            Could not load most-cited decisions.
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-20">No citation data yet.</p>
        )}
        {data && data.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-low text-muted-foreground text-xs text-left">
                    <th className="px-4 py-2.5 font-medium w-12">#</th>
                    <th className="px-4 py-2.5 font-medium">Decision</th>
                    <th className="px-4 py-2.5 font-medium text-right">Citations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((d, i) => (
                    <tr
                      key={d.decision_number}
                      className={`transition-colors ${d.document_id != null ? 'hover:bg-surface-low cursor-pointer' : ''}`}
                      onClick={() => {
                        if (d.document_id != null) {
                          setDocumentTarget({ documentId: d.document_id });
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className={`font-medium ${d.document_id != null ? 'text-accent' : 'text-foreground'}`}>
                          {d.decision_number}
                        </p>
                        {d.title && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{d.title}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{d.citation_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {documentTarget && (
        <DocumentPanel
          target={documentTarget}
          onOpen={setDocumentTarget}
          onClose={() => setDocumentTarget(null)}
          onShowGraph={(seed) => { setGraphSeed(seed); setDocumentTarget(null); }}
        />
      )}
      {graphSeed && (
        <CitationGraph
          seed={graphSeed}
          onOpenDocument={(t) => { setGraphSeed(null); setDocumentTarget(t); }}
          onClose={() => setGraphSeed(null)}
        />
      )}
    </div>
  );
}
