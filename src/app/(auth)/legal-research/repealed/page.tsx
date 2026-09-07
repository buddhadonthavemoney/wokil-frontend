'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { useFeatureEnabled } from '@/hooks/useFeatures';

import { getLegalResearchRepealedRegisterOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { PageHeader } from '@/components/layout/PageHeader';

import { DocumentPanel, type DocumentTarget } from '../components/DocumentPanel';
import { CitationGraph } from '../components/CitationGraph';

const PAGE_SIZE = 25;

export default function RepealedPage() {
  const { enabled } = useFeatureEnabled('legal_research.repealed');
  const [offset, setOffset] = useState(0);
  const [documentTarget, setDocumentTarget] = useState<DocumentTarget | null>(null);
  const [graphSeed, setGraphSeed] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    ...getLegalResearchRepealedRegisterOptions({ query: { limit: PAGE_SIZE, offset } }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const content = (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        icon={<AlertTriangle className="w-5 h-5" />}
        title="Repealed Laws"
        description="Acts, regulations, and ordinances no longer in force."
      />

      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-muted-foreground text-center py-20">
            Could not load repealed laws.
          </p>
        )}
        {data && (
          <div className="max-w-3xl mx-auto space-y-4">
            {data.by_category && Object.keys(data.by_category).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.by_category)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <span key={cat} className="px-2.5 py-1 text-xs rounded-md border border-border bg-surface-low text-foreground">
                      {cat} <span className="text-muted-foreground">({count})</span>
                    </span>
                  ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {data.total.toLocaleString()} repealed document{data.total === 1 ? '' : 's'}
            </p>

            {data.documents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No repealed laws found.</p>
            )}

            {data.documents.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-low text-muted-foreground text-xs text-left">
                      <th className="px-4 py-2.5 font-medium">Title</th>
                      <th className="px-4 py-2.5 font-medium">Category</th>
                      <th className="px-4 py-2.5 font-medium text-right">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.documents.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-surface-low cursor-pointer transition-colors"
                        onClick={() => setDocumentTarget({ documentId: d.id })}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-accent truncate max-w-sm">{d.title}</p>
                          {d.status_label && (
                            <p className="text-[10px] text-destructive mt-0.5">{d.status_label}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{d.category ?? '—'}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {d.doc_year ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  disabled={offset === 0}
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-surface-low disabled:opacity-40"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-surface-low disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
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

  if (!enabled) {
    return (
      <ComingSoonOverlay
        title="Repealed Laws"
        description="Acts, regulations, and ordinances no longer in force."
      >
        {content}
      </ComingSoonOverlay>
    );
  }

  return content;
}
