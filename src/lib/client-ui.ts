'use client';

import { toast } from 'sonner';

// Client-only helpers — `navigator` and `toast` rule out the server, so these
// can't live in `src/lib/utils.ts` (server components import that).

// The API's error bodies are text/plain (http.Error), so `throwOnError`
// rejects with the message string itself — not an axios-shaped
// `{ response: { data: { message } } }`. Reading the axios shape always came
// back undefined, which is why every failure showed the same generic text.
export const apiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};
