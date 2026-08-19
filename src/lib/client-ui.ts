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

// Thrown for a 429 whose Retry-After tells the UI how long to stay disabled,
// rather than re-enabling into a guaranteed second refusal. Shared by domain
// verification and the buy flow's search/resend, which are all throttled
// server-side.
export class VerifyRateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, serverMessage?: string) {
    super(serverMessage || `Please wait ${retryAfterSeconds} seconds before trying again.`);
    this.name = 'VerifyRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Reads a throttled response into the error above. `error` is the API's
// text/plain body when there is one.
export const rateLimitError = (response: Response, error: unknown) =>
  new VerifyRateLimitError(
    Number(response.headers.get('Retry-After')) || 60,
    typeof error === 'string' ? error : undefined
  );
