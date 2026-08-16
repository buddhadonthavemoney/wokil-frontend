'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { listSites } from '@/generated/wokil-api';

/**
 * Email settings are per-domain, but the sidebar entry has to be static — so
 * this resolves the domain and hands off. A `subdomain` site is on our own zone
 * and can't have mail of its own; whether an external one is actually eligible
 * needs a zone read per domain, so leave that to the page itself rather than
 * fanning out. Zero or several domains is `/sites`' job — it already lists them.
 */
export default function EmailPage() {
  const router = useRouter();

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => (await listSites({ throwOnError: true })).data,
  });

  const domains = sites?.filter((site) => site.type === 'external');

  // `replace` so Back skips this page.
  useEffect(() => {
    if (!domains) return;
    router.replace(domains.length === 1 ? `/sites/${domains[0].domain}/email` : '/sites');
  }, [domains, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
