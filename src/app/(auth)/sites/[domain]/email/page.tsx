'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, ExternalLink, Loader2, Mail, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getSiteEmail,
  enableSiteEmail,
  listSiteEmailRoutes,
  createSiteEmailRoute,
  deleteSiteEmailRoute,
  getSiteEmailCatchAll,
  setSiteEmailCatchAll,
  getSiteZone,
} from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { apiErrorMessage, copyToClipboard } from '@/lib/client-ui';

const guideLinkClass = 'inline-flex items-center gap-1 text-accent underline underline-offset-2';

/** Monospace value with a copy button — the fields users retype wrongly. */
function CopyValue({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <code className="px-1.5 py-0.5 bg-muted/50 rounded border border-border/50 text-[11px] font-mono break-all">
        {value}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        aria-label={`Copy ${value}`}
        onClick={() => copyToClipboard(value)}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </span>
  );
}

/**
 * Forwarding only gets mail in. Gmail can send *as* one of these addresses over
 * SMTP, but it confirms ownership by mailing a code to the address itself —
 * which only arrives because forwarding is already set up. Hence the guide
 * living here, under the addresses, rather than anywhere earlier in the flow.
 */
function SendAsGuide({ addresses }: { addresses: string[] }) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="send-as" className="border-b-0 border-t border-border/50">
        <AccordionTrigger className="text-sm">Send mail from these addresses in Gmail</AccordionTrigger>
        <AccordionContent>
          <ol className="flex flex-col gap-3 text-xs text-muted-foreground list-decimal pl-4 marker:text-muted-foreground">
            <li>
              Turn on{' '}
              <a
                href="https://myaccount.google.com/signinoptions/two-step-verification"
                target="_blank"
                rel="noopener noreferrer"
                className={guideLinkClass}
              >
                2-Step Verification
                <ExternalLink className="h-3 w-3" />
              </a>{' '}
              on your Google account. Google hides App Passwords until it is on.
            </li>
            <li>
              Create an{' '}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className={guideLinkClass}
              >
                App Password
                <ExternalLink className="h-3 w-3" />
              </a>{' '}
              — Google
              shows a 16-character password once. Copy it now; it is not shown again.
            </li>
            <li>
              In Gmail, go to Settings → See all settings → Accounts and Import → &quot;Send mail as&quot; →
              Add another email address.
            </li>
            <li>
              <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
                Enter your name and the address:
                {addresses.map((address) => (
                  <CopyValue key={address} value={address} />
                ))}
              </span>
              Leave &quot;Treat as an alias&quot; checked.
            </li>
            <li>
              <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
                SMTP server <CopyValue value="smtp.gmail.com" />, port <CopyValue value="587" />,
              </span>
              username = your full Gmail address, password = the App Password from step 2, and TLS.
            </li>
            <li>
              Gmail emails a confirmation code to the address above. Your forwarding delivers it to your
              inbox — paste it back into Gmail and the address is ready to send from.
            </li>
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function SiteEmailPage() {
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params?.domain ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [destinationInput, setDestinationInput] = useState('');
  const [localPart, setLocalPart] = useState('');

  // Email Routing is a property of the site's Cloudflare zone, so nothing on
  // this page can work — or is even safe to ask Cloudflare about — until the
  // delegation is live. This is the gate; the hidden button on the sites grid
  // is only a convenience.
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useQuery({
    queryKey: ['site-zone', domain],
    queryFn: async () => (await getSiteZone({ path: { domain }, throwOnError: true })).data,
    enabled: !!domain,
    retry: false,
  });

  const zoneActive = zone?.status === 'active';

  const { data: email, isLoading: emailLoading, error: emailError } = useQuery({
    queryKey: ['site-email', domain],
    queryFn: async () => (await getSiteEmail({ path: { domain }, throwOnError: true })).data,
    enabled: zoneActive,
    retry: false,
    // Cloudflare only marks the destination verified once the owner clicks the
    // link it emailed them, which happens outside this tab.
    refetchInterval: (query) => (query.state.data && !query.state.data.verified ? 10000 : false),
  });

  const verified = !!email?.verified;

  const { data: routes } = useQuery({
    queryKey: ['site-email-routes', domain],
    queryFn: async () => (await listSiteEmailRoutes({ path: { domain }, throwOnError: true })).data,
    enabled: verified,
    retry: false,
  });

  const { data: catchAll } = useQuery({
    queryKey: ['site-email-catch-all', domain],
    queryFn: async () => (await getSiteEmailCatchAll({ path: { domain }, throwOnError: true })).data,
    enabled: verified,
    retry: false,
  });

  const invalidate = (key: string) => queryClient.invalidateQueries({ queryKey: [key, domain] });

  const enableMutation = useMutation({
    mutationFn: (destination: string) =>
      enableSiteEmail({ path: { domain }, body: { destination }, throwOnError: true }),
    onSuccess: () => {
      invalidate('site-email');
      toast.success('Check that inbox for Cloudflare\'s verification link.');
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not enable email forwarding')),
  });

  const addRouteMutation = useMutation({
    mutationFn: (part: string) =>
      createSiteEmailRoute({
        path: { domain },
        body: { localPart: part, destination: email!.destination },
        throwOnError: true,
      }),
    onSuccess: () => {
      invalidate('site-email-routes');
      setLocalPart('');
      toast.success('Address added');
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not add that address')),
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (tag: string) => deleteSiteEmailRoute({ path: { domain, tag }, throwOnError: true }),
    onSuccess: () => {
      invalidate('site-email-routes');
      toast.success('Address removed');
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not remove that address')),
  });

  const catchAllMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      setSiteEmailCatchAll({
        path: { domain },
        // The destination is ignored when disabling, but the schema still
        // wants the field, so send the verified inbox either way.
        body: { enabled, destination: email!.destination },
        throwOnError: true,
      }),
    onSuccess: () => invalidate('site-email-catch-all'),
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not change the catch-all')),
  });

  const header = (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="gap-2 w-fit -ml-2" onClick={() => router.push('/sites')}>
        <ArrowLeft className="w-4 h-4" />
        Back to sites
      </Button>
      <PageHeader
        icon={<Mail />}
        title="Email Forwarding"
        description={`Receive mail at addresses on ${domain} and have it forwarded to an inbox you already use.`}
      />
    </div>
  );

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex flex-col gap-10">
          {header}
          {children}
        </div>
      </main>
    </div>
  );

  if (zoneLoading || (zoneActive && emailLoading)) {
    return shell(
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // A CNAME-mode site has no zone at all and 404s here; a nameserver-mode one
  // has a zone that is still `pending` until the registrar is repointed.
  // Neither can route mail, and both are reachable by typing the URL.
  if (zoneError || !zoneActive) {
    const message = apiErrorMessage(zoneError, '');
    const noZone = message.includes('no Cloudflare zone');
    const notDelegated = !zoneError && !zoneActive;
    return shell(
      <Alert variant={noZone || notDelegated ? 'accent' : 'destructive'}>
        <Mail className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">
          {noZone
            ? 'Email forwarding needs nameserver delegation'
            : notDelegated
              ? 'Verify this domain first'
              : 'Could not load email settings'}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          {noZone
            ? `${domain} is linked with the CNAME flow, so we don't hold its DNS and can't route its mail. Re-onboard the domain with "Point your nameservers" to enable forwarding.`
            : notDelegated
              ? `We don't hold ${domain}'s DNS yet, so there is nothing to forward. Point your registrar at the nameservers shown under "Verify Domain", and email settings unlock once the delegation goes live.`
              : message || 'Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (emailError) {
    return shell(
      <Alert variant="destructive">
        <Mail className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">Could not load email settings</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          {apiErrorMessage(emailError, 'Please try again.')}
        </AlertDescription>
      </Alert>
    );
  }

  return shell(
    <>
      <Card className="border-none shadow-premium">
        <CardHeader>
          <CardTitle className="text-lg">Destination inbox</CardTitle>
          <CardDescription>Where mail sent to this domain ends up.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {email?.enabled && email.destination ? (
            <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-xl border border-border/50">
              <code className="text-xs font-mono break-all">{email.destination}</code>
              {verified ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-success shrink-0">Verified</span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Awaiting verification
                </span>
              )}
            </div>
          ) : (
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (destinationInput.trim()) enableMutation.mutate(destinationInput.trim());
              }}
            >
              <div className="grid gap-2 flex-1">
                <Label htmlFor="destination">Your existing email address</Label>
                <Input
                  id="destination"
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={enableMutation.isPending}>
                {enableMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enable forwarding
              </Button>
            </form>
          )}

          {email?.enabled && !verified && (
            <Alert variant="accent">
              <Mail className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Check your inbox</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Cloudflare emailed {email.destination} a verification link. Forwarding addresses cannot be
                created until it is clicked — this page checks every 10 seconds.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className={`border-none shadow-premium ${verified ? '' : 'opacity-50 pointer-events-none'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Addresses</CardTitle>
          <CardDescription>Each address forwards to your verified inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (localPart.trim()) addRouteMutation.mutate(localPart.trim());
            }}
          >
            <div className="grid gap-2 flex-1">
              <Label htmlFor="localPart">New address</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="localPart"
                  placeholder="contact"
                  value={localPart}
                  onChange={(e) => setLocalPart(e.target.value)}
                  className="max-w-[200px]"
                />
                <span className="text-sm text-muted-foreground font-mono truncate">@{domain}</span>
              </div>
            </div>
            <Button type="submit" variant="outline" className="gap-2" disabled={addRouteMutation.isPending}>
              {addRouteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </form>

          {routes && routes.length > 0 ? (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Forwards to</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.tag}>
                    <TableCell className="font-mono text-xs">{route.address}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{route.destination}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteRouteMutation.mutate(route.tag)}
                        disabled={deleteRouteMutation.isPending && deleteRouteMutation.variables === route.tag}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <SendAsGuide addresses={routes.map((route) => route.address)} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No forwarding addresses yet. Add one above — <span className="font-mono">contact</span> is a good start.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className={`border-none shadow-premium ${verified ? '' : 'opacity-50 pointer-events-none'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Catch-all</CardTitle>
          <CardDescription>
            Forward mail sent to any other address on {domain}. With this off, such mail is rejected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Label htmlFor="catch-all" className="font-medium">
            Forward everything else to {email?.destination}
          </Label>
          <Switch
            id="catch-all"
            checked={!!catchAll?.enabled}
            disabled={catchAllMutation.isPending}
            onCheckedChange={(checked) => catchAllMutation.mutate(checked)}
          />
        </CardContent>
      </Card>
    </>
  );
}
