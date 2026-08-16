import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Absolute-URLs its argument: bare hosts get https://, http(s):// passes. */
export function siteHref(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

/**
 * Reduces what people actually paste ("HTTPS://Example.com/about ") to the bare
 * hostname the API wants. Deliberately keeps a leading `www.` — dropping it
 * would silently change which hostname the user asked for.
 */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/\.$/, '');
}

/** Two or more labels, alphabetic TLD. Expects an already-normalized host. */
export function isValidDomain(domain: string): boolean {
  return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain);
}
