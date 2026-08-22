'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, MessageSquareText, Network, X } from 'lucide-react';

import type { LegalResearchEntity } from '@/generated/wokil-api';
import { getLegalResearchEntityOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';

import type { DocumentTarget } from '../components/DocumentPanel';
import { setChatPrefill } from '../prefill';

interface EntityDetailProps {
  entity: LegalResearchEntity;
  onOpenDocument: (target: DocumentTarget) => void;
  onClose: () => void;
  onShowGraph?: (seed: string) => void;
}

/**
 * One person and everything of theirs in the corpus. The "ask about" button is
 * the point of the screen: it hands the chat this person's documents as the
 * scope, which is the only way to ask "what has this judge held?" and get an
 * answer that cannot wander outside their cases.
 */
export function EntityDetail({ entity, onOpenDocument, onClose, onShowGraph }: EntityDetailProps) {
  const router = useRouter();

  const detailQuery = useQuery(
    getLegalResearchEntityOptions({ path: { entity_id: entity.id } }),
  );

  const documents = detailQuery.data?.documents ?? [];

  const askAboutEntity = () => {
    setChatPrefill({
      question: `${entity.name} `,
      // The scope is the working set, not the question — the chat reads the
      // name from the question text and stays inside these documents.
      scope: documents.length > 0 ? { document_ids: documents.map((d) => d.document_id) } : {},
    });
    router.push('/legal-research');
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-0">
      <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-foreground">{entity.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {entity.role} · {entity.document_count} document
            {entity.document_count === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-low text-muted-foreground"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="px-5 py-3 border-b border-border flex gap-2">
        <Button onClick={askAboutEntity} disabled={detailQuery.isPending} className="flex-1">
          <MessageSquareText className="w-4 h-4" /> Ask about this person
        </Button>
        {onShowGraph && (
          <Button
            variant="outline"
            onClick={() => onShowGraph(`entity:${entity.id}`)}
            title="Show citation graph"
          >
            <Network className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {detailQuery.isPending && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading their documents…
          </p>
        )}
        {detailQuery.isError && (
          <p className="text-xs text-muted-foreground">Couldn&apos;t load their documents.</p>
        )}
        {detailQuery.isSuccess && documents.length === 0 && (
          <p className="text-xs text-muted-foreground">
            This person is named in the corpus but no document is linked to them.
          </p>
        )}
        {documents.map((document) => (
          <button
            key={document.document_id}
            type="button"
            onClick={() => onOpenDocument({ documentId: document.document_id })}
            className="w-full text-left p-3 rounded-lg border border-border bg-card transition-colors hover:border-accent hover:bg-surface-low"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-foreground">{document.title}</p>
              {document.is_repealed && (
                <span className="shrink-0 label-caps text-[10px] px-2 py-0.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {document.status_label ?? 'Repealed'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {[document.collection, document.category, document.doc_year]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
