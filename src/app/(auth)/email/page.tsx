'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2, Mail } from 'lucide-react';

import { listSites } from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Email settings are per-domain, but the sidebar entry has to be static — so
 * this picks the domain. Eligibility matches the "Email" button on the site
 * cards exactly (external + deployed): a `subdomain` sits on our own zone and
 * can't have mail of its own, and an undeployed domain has no zone to route it.
 */
export default function EmailPage() {
  const router = useRouter();

  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => (await listSites({ throwOnError: true })).data,
  });

  const domains = sites?.filter((site) => site.type === 'external' && site.status === 'deployed') ?? [];
  const onlyDomain = domains.length === 1 ? domains[0].domain : null;

  // One domain is the common case — showing a list of one is just a click the
  // user has no choice in. `replace` so Back skips this page.
  useEffect(() => {
    if (onlyDomain) router.replace(`/sites/${onlyDomain}/email`);
  }, [onlyDomain, router]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex flex-col gap-10">
          <PageHeader
            icon={<Mail />}
            title="Email Forwarding"
            description="Receive mail at addresses on your own domain and have it forwarded to an inbox you already use."
          />

          {isLoading || onlyDomain ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : domains.length === 0 ? (
            <Alert variant="accent">
              <Mail className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">No live domain to forward mail for</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Email forwarding runs on a domain you own, once it is live. Add one under{' '}
                <Link href="/sites" className="text-accent underline underline-offset-2">Sites</Link>{' '}
                and let us manage its DNS — it shows up here as soon as the domain goes live.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">Choose a domain to set up email forwarding for.</p>
              {domains.map((site) => (
                <Link key={site.id} href={`/sites/${site.domain}/email`}>
                  <Card className="transition-colors hover:border-accent">
                    <CardContent className="flex items-center justify-between py-4">
                      <span className="font-medium text-sm">{site.domain}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
