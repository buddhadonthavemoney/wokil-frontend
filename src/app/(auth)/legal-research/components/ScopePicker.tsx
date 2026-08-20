'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Filter, Loader2, X } from 'lucide-react';

import {
  getLegalResearchScopeOptions,
  type LegalResearchScope,
  type LegalResearchScopeOptions,
} from '@/generated/wokil-api';

// An omitted or empty scope means the whole corpus — the picker never sends
// empty arrays, which the backend would read as a filter matching nothing.
export function isWholeCorpus(scope: LegalResearchScope): boolean {
  return (
    !scope.collections?.length && !scope.categories?.length && !scope.document_ids?.length
  );
}

function toggle(list: string[] | undefined, value: string): string[] {
  const current = list ?? [];
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

interface ScopePickerProps {
  scope: LegalResearchScope;
  onChange: (scope: LegalResearchScope) => void;
  disabled?: boolean;
}

export function ScopePicker({ scope, onChange, disabled }: ScopePickerProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const optionsQuery = useQuery({
    queryKey: ['legal-research', 'scope-options'],
    queryFn: async (): Promise<LegalResearchScopeOptions> => {
      const { data, error } = await getLegalResearchScopeOptions();
      if (error !== undefined) throw new Error('Failed to load the corpus taxonomy.');
      return data as LegalResearchScopeOptions;
    },
    // Corpus-level and cached server-side for 10 minutes; no reason for the
    // chat screen to refetch it on every mount.
    staleTime: 10 * 60 * 1000,
  });

  const selectedCount = (scope.collections?.length ?? 0) + (scope.categories?.length ?? 0);
  const label = isWholeCorpus(scope)
    ? 'Whole corpus'
    : `${selectedCount} filter${selectedCount === 1 ? '' : 's'}`;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
          isWholeCorpus(scope)
            ? 'border-border bg-card text-muted-foreground hover:border-accent'
            : 'border-accent/40 bg-accent/10 text-accent-foreground'
        }`}
      >
        <Filter className="w-3.5 h-3.5" />
        {label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {!isWholeCorpus(scope) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="ml-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="Search the whole corpus"
        >
          <X className="w-3.5 h-3.5 inline" />
        </button>
      )}

      {open && (
        /* Click-anywhere-else closes the panel. A backdrop rather than a
           document listener: it also stops a stray click landing on the
           thread underneath. */
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}

      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-20 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-lg p-2">
          {optionsQuery.isPending && (
            <p className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading collections…
            </p>
          )}
          {optionsQuery.isError && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Couldn&apos;t load the corpus taxonomy.
            </p>
          )}
          {(optionsQuery.data?.collections ?? []).map((collection) => {
            const isOpen = expanded === collection.collection;
            const checked = scope.collections?.includes(collection.collection) ?? false;
            return (
              <div key={collection.collection} className="rounded-lg">
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface-low rounded-lg">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onChange({ ...scope, collections: toggle(scope.collections, collection.collection) })
                    }
                    className="accent-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : collection.collection)}
                    className="flex-1 flex items-center justify-between gap-2 text-left"
                  >
                    <span className="text-sm text-foreground truncate">{collection.collection}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {collection.document_count.toLocaleString()}
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="pl-7 pb-1">
                    {collection.categories.map((category) => (
                      <label
                        key={category.category}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-surface-low rounded-md cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={scope.categories?.includes(category.category) ?? false}
                          onChange={() =>
                            onChange({ ...scope, categories: toggle(scope.categories, category.category) })
                          }
                          className="accent-accent"
                        />
                        <span className="flex-1 text-xs text-foreground truncate">
                          {category.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {category.document_count.toLocaleString()}
                        </span>
                      </label>
                    ))}
                    {/* The category list is the head of the distribution, not
                        all of it — say so rather than implying it is complete. */}
                    {collection.truncated && (
                      <p className="px-2 py-1 text-[11px] text-muted-foreground">
                        Showing {collection.categories.length} of{' '}
                        {(collection.category_total ?? 0).toLocaleString()} categories.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
