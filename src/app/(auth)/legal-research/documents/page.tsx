'use client';

import { useDeferredValue, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FileText, Loader2, Search } from 'lucide-react';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { useFeatureEnabled } from '@/hooks/useFeatures';

import {
  getLegalResearchDocumentFacetsOptions,
  listLegalResearchDocumentsOptions,
} from '@/generated/wokil-api/@tanstack/react-query.gen';
import { PageHeader } from '@/components/layout/PageHeader';

import { DocumentPanel, type DocumentTarget } from '../components/DocumentPanel';
import { CitationGraph } from '../components/CitationGraph';
import { NepaliSearchInput } from '../components/NepaliSearchInput';

const PAGE_SIZE = 25;

export default function DocumentsPage() {
  const { enabled } = useFeatureEnabled('legal_research.documents');
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search.trim());
  const [offset, setOffset] = useState(0);
  const [collection, setCollection] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [documentTarget, setDocumentTarget] = useState<DocumentTarget | null>(null);
  const [graphSeed, setGraphSeed] = useState<string | null>(null);

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setOffset(0);
  }

  const facetsQuery = useQuery({
    ...getLegalResearchDocumentFacetsOptions(),
    staleTime: 10 * 60 * 1000,
  });

  const { data, isPending, isError } = useQuery({
    ...listLegalResearchDocumentsOptions({
      query: {
        q: query || undefined,
        collection: collection || undefined,
        year: year ? parseInt(year, 10) : undefined,
        limit: PAGE_SIZE,
        offset,
      },
    }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const content = (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        icon={<FileText className="w-5 h-5" />}
        title="Documents"
        description="Browse and search all documents in the legal corpus."
      />

      <div className="px-6 pt-4">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <NepaliSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by title or filename…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
          {facetsQuery.data && (
            <>
              <select
                value={collection}
                onChange={(e) => { setCollection(e.target.value); setOffset(0); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">All collections</option>
                {Object.entries(facetsQuery.data.collections)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => (
                    <option key={name} value={name}>{name} ({count})</option>
                  ))}
              </select>
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setOffset(0); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">All years</option>
                {Object.entries(facetsQuery.data.years)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([y, count]) => (
                    <option key={y} value={y}>{y} ({count})</option>
                  ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-muted-foreground text-center py-20">
            Could not load documents.
          </p>
        )}
        {data && data.documents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-20">
            {query ? 'No documents match your search.' : 'No documents in the corpus yet.'}
          </p>
        )}
        {data && data.documents.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-xs text-muted-foreground">
              {data.total.toLocaleString()} document{data.total === 1 ? '' : 's'}
              {query && ' matching your search'}
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-low text-muted-foreground text-xs text-left">
                    <th className="px-4 py-2.5 font-medium">Title</th>
                    <th className="px-4 py-2.5 font-medium">Collection</th>
                    <th className="px-4 py-2.5 font-medium text-right">Year</th>
                    <th className="px-4 py-2.5 font-medium text-right">Chunks</th>
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
                        {d.category && (
                          <p className="text-xs text-muted-foreground mt-0.5">{d.category}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.collection ?? '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {d.doc_year ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {d.chunk_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
        title="Documents"
        description="Browse and search all documents in the legal corpus."
      >
        {content}
      </ComingSoonOverlay>
    );
  }

  return content;
}
