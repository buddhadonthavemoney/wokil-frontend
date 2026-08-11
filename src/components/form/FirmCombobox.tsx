'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, Plus, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchFirms } from '@/generated/wokil-api';
import { FirmSummary } from '@/types/firm';

interface FirmComboboxProps {
  /** The display name currently stored on the profile. */
  value: string;
  /** The firms row this profile is linked to, when one was picked. */
  firmId?: number;
  onChange: (fields: { lawFirmName: string; firmId?: number }) => void;
}

/**
 * Firm name field with a lookup over registered firms.
 *
 * Writes `lawFirmName` and `firmId` separately and deliberately: the name is
 * what the themes render, and stays free text so a lawyer at an unregistered
 * firm can still fill this in. `firmId` is set only when a suggestion is
 * actually picked, and is dropped again the moment the text is edited by
 * hand — a stale id pointing at a firm whose name no longer matches would be
 * worse than no id at all.
 *
 * Under today's model affiliation is display-only: there is no membership to
 * confuse it with, and picking a firm grants no access to it.
 */
export function FirmCombobox({ value, firmId, onChange }: FirmComboboxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<FirmSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep in step when the profile loads or the step is cleared from outside.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Same debounce shape as the subdomain availability check, at the 300ms the
  // typeahead wants rather than that step's 500ms.
  useEffect(() => {
    const term = query.trim();
    if (!isOpen || term.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await searchFirms({ query: { search: term } });
        setResults((data as FirmSummary[]) ?? []);
      } catch (error) {
        // A lookup failure must not block typing — the field is free text and
        // optional, so the worst case is simply no suggestions.
        console.error('Firm search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const handleType = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    // Typing detaches from whichever firm was picked: the id must never
    // outlive the name it was chosen for.
    onChange({ lawFirmName: text, firmId: undefined });
  };

  const pick = (firm: FirmSummary) => {
    setQuery(firm.name);
    setIsOpen(false);
    onChange({ lawFirmName: firm.name, firmId: firm.id });
  };

  const showCreate = query.trim().length >= 2 && !isSearching && results.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        id="lawFirmName"
        placeholder="e.g., Smith & Associates"
        value={query}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => setIsOpen(true)}
        // Enter picks nothing here; the wizard's Enter handler advances the
        // step, which would skip past the suggestions the user just opened.
        data-prevent-navigation
        autoComplete="off"
        className="h-12"
      />

      {firmId !== undefined && (
        <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-primary" />
          Linked to a registered firm
        </p>
      )}

      {isOpen && (isSearching || results.length > 0 || showCreate) && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching firms…
            </div>
          )}

          {!isSearching &&
            results.map((firm) => (
              <button
                key={firm.id}
                type="button"
                onClick={() => pick(firm)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
              >
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">
                    {firm.name}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">{firm.slug}</span>
                </span>
              </button>
            ))}

          {showCreate && (
            <button
              type="button"
              onClick={() => router.push('/firm-builder')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-t border-border"
            >
              <Plus className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm">
                <span className="font-medium text-foreground">Can&apos;t find your firm?</span>{' '}
                <span className="text-muted-foreground">Create one</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
