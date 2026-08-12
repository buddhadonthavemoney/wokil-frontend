import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Absolute-URLs its argument: bare hosts get https://, http(s):// passes. */
export function siteHref(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}
