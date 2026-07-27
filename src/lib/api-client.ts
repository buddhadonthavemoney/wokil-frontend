import type { CreateClientConfig } from '../generated/wokil-api/client.gen';

// Spec paths already include /api, so strip the legacy /api suffix from the env var.
const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

// NOTE: client.gen.ts imports createClientConfig from this file — importing
// anything from client.gen here would be a circular reference.
export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl,
    auth: () =>
        typeof window !== 'undefined'
            ? (localStorage.getItem('token') ?? undefined)
            : undefined,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await fetch(input, init);
        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        return response;
    },
});
