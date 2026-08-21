'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Loader2, Search, Users } from 'lucide-react';

import {
  listLegalResearchEntities,
  type LegalResearchEntity,
  type LegalResearchEntityList,
} from '@/generated/wokil-api';
import {
  listLegalResearchEntityRolesOptions,
} from '@/generated/wokil-api/@tanstack/react-query.gen';
import { PageHeader } from '@/components/layout/PageHeader';

import { DocumentPanel, type DocumentTarget } from '../components/DocumentPanel';
import { EntityDetail } from './EntityDetail';

const PAGE_SIZE = 25;

export default function LegalResearchEntitiesPage() {
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search.trim());
  const [role, setRole] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<LegalResearchEntity | null>(null);
  const [documentTarget, setDocumentTarget] = useState<DocumentTarget | null>(null);

  // Reset offset when the deferred query changes.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setOffset(0);
  }

  const rolesQuery = useQuery({
    ...listLegalResearchEntityRolesOptions(),
    staleTime: 10 * 60 * 1000,
  });

  const entitiesQuery = useQuery({
    queryKey: ['legal-research', 'entities', query, role, offset],
    queryFn: async (): Promise<LegalResearchEntityList> => {
      const { data, error } = await listLegalResearchEntities({
        query: {
          ...(query ? { q: query } : {}),
          ...(role ? { role } : {}),
          limit: PAGE_SIZE,
          offset,
        },
      });
      if (error !== undefined) throw new Error('Failed to search the corpus.');
      return data as LegalResearchEntityList;
    },
    // Keeps the previous page on screen while the next one loads, so typing
    // does not blank the list on every pause.
    placeholderData: keepPreviousData,
  });

  const entities = entitiesQuery.data?.entities ?? [];
  const total = entitiesQuery.data?.total ?? 0;

  const roles = useMemo(
    () => [null, ...(rolesQuery.data?.roles ?? [])],
    [rolesQuery.data],
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-6 max-w-7xl w-full">
        <PageHeader
          icon={<Users />}
          title="People in the corpus"
          description="Advocates, judges and parties extracted from the Najir decisions — find everything one person appears in, then ask the corpus about them."
        />

        <div className="mt-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Roles come from the API — a role a new ingest invents shows up
              here without a frontend change. */}
          <div className="flex items-center gap-2 flex-wrap">
            {roles.map((r) => (
              <button
                key={r?.role ?? '__all'}
                type="button"
                onClick={() => {
                  setRole(r?.role ?? null);
                  setOffset(0);
                }}
                className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                  role === (r?.role ?? null)
                    ? 'border-accent bg-accent/10 text-accent-foreground'
                    : 'border-border bg-card text-foreground hover:border-accent'
                }`}
              >
                {r === null
                  ? 'All roles'
                  : `${r.role} (${r.entity_count.toLocaleString()})`}
              </button>
            ))}
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <p className="text-xs label-caps text-muted-foreground">
                  {entitiesQuery.isSuccess ? `${total.toLocaleString()} found` : 'Searching'}
                </p>
                {entitiesQuery.isFetching && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                )}
              </div>

              <div className="divide-y divide-border">
                {entitiesQuery.isError && (
                  <p className="px-5 py-6 text-sm text-muted-foreground">
                    Couldn&apos;t search the corpus. Try again in a moment.
                  </p>
                )}
                {entitiesQuery.isSuccess && entities.length === 0 && (
                  <p className="px-5 py-6 text-sm text-muted-foreground">
                    {query || role
                      ? 'Nobody in the corpus matches that.'
                      : 'No people have been extracted from the corpus yet.'}
                  </p>
                )}
                {entities.map((entity) => (
                  <button
                    key={entity.id}
                    type="button"
                    onClick={() => setSelected(entity)}
                    className={`w-full text-left px-5 py-3 flex items-center justify-between gap-3 transition-colors hover:bg-surface-low ${
                      selected?.id === entity.id ? 'bg-surface-low' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{entity.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{entity.role}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {entity.document_count.toLocaleString()} doc
                      {entity.document_count === 1 ? '' : 's'}
                    </span>
                  </button>
                ))}
              </div>

              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                  <button
                    type="button"
                    disabled={offset === 0}
                    onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs text-foreground disabled:opacity-40 hover:border-accent transition-colors"
                  >
                    Previous
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    disabled={offset + PAGE_SIZE >= total}
                    onClick={() => setOffset((o) => o + PAGE_SIZE)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs text-foreground disabled:opacity-40 hover:border-accent transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {selected ? (
              <EntityDetail
                entity={selected}
                onOpenDocument={setDocumentTarget}
                onClose={() => setSelected(null)}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pick someone to see their documents and ask the corpus about them.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {documentTarget && (
        <DocumentPanel
          target={documentTarget}
          onOpen={setDocumentTarget}
          onClose={() => setDocumentTarget(null)}
        />
      )}
    </div>
  );
}
