'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ExternalLink, Loader2, X } from 'lucide-react';

import {
  getLegalResearchDocument,
  getLegalResearchDocumentGraph,
  type LegalResearchCitation,
  type LegalResearchDocument,
  type LegalResearchDocumentGraph,
} from '@/generated/wokil-api';

export interface DocumentTarget {
  documentId: number;
  /** The passage that was cited, scrolled to and highlighted when present. */
  chunkId?: number;
}

function CitationList({
  title,
  citations,
  onOpen,
}: {
  title: string;
  citations: LegalResearchCitation[];
  onOpen: (target: DocumentTarget) => void;
}) {
  if (citations.length === 0) return null;
  return (
    <div>
      <p className="text-xs label-caps text-muted-foreground mb-2">
        {title} ({citations.length})
      </p>
      <div className="space-y-1.5">
        {citations.map((citation, i) => (
          <button
            key={`${citation.decision_number}-${i}`}
            type="button"
            // An unresolved edge names a decision that is cited but not in the
            // corpus — there is nothing to open, so it is not a button.
            disabled={!citation.resolved || citation.document_id == null}
            onClick={() => onOpen({ documentId: citation.document_id as number })}
            className="w-full text-left px-3 py-2 rounded-lg border border-border text-xs transition-colors enabled:hover:border-accent enabled:hover:bg-surface-low disabled:opacity-60"
          >
            <span className="text-foreground">
              {citation.title ?? `निर्णय नं. ${citation.decision_number}`}
            </span>
            {!citation.resolved && (
              <span className="ml-2 text-muted-foreground">not in the corpus</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DocumentPanelProps {
  target: DocumentTarget;
  onOpen: (target: DocumentTarget) => void;
  onClose: () => void;
}

/**
 * The cited source, opened in place. Metadata/related documents and the text
 * are two independent queries with their own error states — either upstream
 * can be down without blanking the whole panel.
 */
export function DocumentPanel({ target, onOpen, onClose }: DocumentPanelProps) {
  const citedChunkRef = useRef<HTMLDivElement>(null);

  const documentQuery = useQuery({
    queryKey: ['legal-research', 'document', target.documentId],
    queryFn: async (): Promise<LegalResearchDocument> => {
      const { data, error } = await getLegalResearchDocument({
        path: { document_id: target.documentId },
      });
      if (error !== undefined) throw new Error('Failed to load the document text.');
      return data as LegalResearchDocument;
    },
    // A failure here is the corpus service being down, not a blip — retrying
    // just delays the "text unavailable" notice the reader needs to see.
    retry: false,
  });

  const graphQuery = useQuery({
    queryKey: ['legal-research', 'graph', target.documentId],
    queryFn: async (): Promise<LegalResearchDocumentGraph> => {
      const { data, error } = await getLegalResearchDocumentGraph({
        path: { document_id: target.documentId },
      });
      if (error !== undefined) throw new Error('Failed to load the citation graph.');
      return data as LegalResearchDocumentGraph;
    },
    retry: false,
  });

  // Anchor on the cited passage rather than dumping the reader at the top of
  // a 60-chunk decision.
  useEffect(() => {
    if (documentQuery.isSuccess) {
      citedChunkRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [documentQuery.isSuccess, target.chunkId]);

  const graph = graphQuery.data;
  const title = documentQuery.data?.title ?? graph?.title ?? 'Document';
  const collection = documentQuery.data?.collection ?? graph?.collection;
  const category = documentQuery.data?.category ?? graph?.category;
  const sourceUrl = documentQuery.data?.source_url ?? graph?.source_url;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col pt-16 lg:pt-0">
      <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {[collection, category, graph?.doc_year].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-surface-low text-muted-foreground"
              title="Open the original source"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-low text-muted-foreground"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Repeal is a structured field from the graph, never the ⚠ prefix RAG
          bakes into citation strings — that prose will be reworded. */}
      {graph?.is_repealed && (
        <div className="flex items-start gap-3 px-5 py-3 border-b border-border bg-destructive/10">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            {graph.status_label ?? 'This law has been repealed.'} Do not rely on it as
            current authority.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {documentQuery.isPending && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading the document…
          </p>
        )}
        {documentQuery.isError && (
          <p className="text-xs text-muted-foreground">
            The document text is unavailable right now.
          </p>
        )}

        {(documentQuery.data?.chunks ?? []).map((chunk) => {
          const isCited = target.chunkId != null && chunk.chunk_id === target.chunkId;
          return (
            <div
              key={chunk.chunk_index}
              ref={isCited ? citedChunkRef : undefined}
              className={`text-sm leading-relaxed whitespace-pre-wrap rounded-lg ${
                isCited
                  ? 'bg-accent/10 border border-accent/40 p-3 -mx-1'
                  : 'text-foreground'
              }`}
            >
              {chunk.section_path && (
                <p className="text-[11px] label-caps text-muted-foreground mb-1">
                  {chunk.section_path}
                  {chunk.page_start != null && ` · p.${chunk.page_start}`}
                </p>
              )}
              {chunk.text}
            </div>
          );
        })}
        {documentQuery.isSuccess && (documentQuery.data.chunks ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground">This document has no stored text.</p>
        )}

        {graph && (
          <div className="pt-2 border-t border-border space-y-4">
            <CitationList title="Cites" citations={graph.cites} onOpen={onOpen} />
            <CitationList title="Cited by" citations={graph.cited_by} onOpen={onOpen} />
          </div>
        )}
      </div>
    </aside>
  );
}
