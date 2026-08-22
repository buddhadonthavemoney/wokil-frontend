import type { LegalResearchScope } from '@/generated/wokil-api';

export interface ChatPrefill {
  question: string;
  scope: LegalResearchScope;
}

const KEY = 'legal-research:prefill';

// Handed over in sessionStorage rather than the URL: a scope is up to 200
// document ids, which is a query string no browser should have to carry.
export function setChatPrefill(prefill: ChatPrefill): void {
  sessionStorage.setItem(KEY, JSON.stringify(prefill));
}

/** Reads and clears the prefill — it applies to the next chat load, once. */
export function takeChatPrefill(): ChatPrefill | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as ChatPrefill;
  } catch {
    return null;
  }
}
