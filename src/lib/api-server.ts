import { getPublicDirectory } from '@/generated/wokil-api';
import type { PublicDirectoryResponse } from '@/generated/wokil-api';

export const publicPeopleServer = {
    list: async (): Promise<PublicDirectoryResponse> => {
        // Build-time prerender must not depend on backend uptime — fall back to
        // the API's own empty shape and let ISR fill in real data (spec 002/09).
        try {
            const { data } = await getPublicDirectory({ throwOnError: true });
            return data;
        } catch (error) {
            console.error('[api-server] /public/people failed, using empty fallback:', error);
            return { profiles: null, meta: { total: 0, hidden: 0 } };
        }
    },
};
