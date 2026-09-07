'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, ExternalLink, Loader2, Mail, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getSiteEmailOverview,
  enableSiteEmail,
  removeSiteEmailDestination,
  getMyFirm,
  createSiteEmailRoute,
  deleteSiteEmailRoute,
  setSiteEmailCatchAll,
  getSiteZone,
} from '@/generated/wokil-api';
import type { SiteEmail, SiteEmailOverview, SiteEmailRoute } from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { apiErrorMessage, copyToClipboard } from '@/lib/client-ui';
import { useFeatureEnabled } from '@/hooks/useFeatures';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';

// New rows slide up into the list while the add form below is pushed down —
// the two together read as a swap. motion-safe: leaves it still for anyone who
// has asked for reduced motion.
const enterRowClass =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300';

const overviewKey = (domain: string) => ['site-email-overview', domain];

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
  const { enabled: emailEnabled } = useFeatureEnabled('email_routing');
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params?.domain ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [destinationInput, setDestinationInput] = useState('');
  const [localPart, setLocalPart] = useState('');
  // Which inbox a new address forwards to. Cloudflare allows exactly one per
  // address, so this is a single value rather than a set.
  const [routeTarget, setRouteTarget] = useState('');
  const [catchAllTarget, setCatchAllTarget] = useState('');
  // Identifies the row that just arrived so only it animates, not the whole list.
  const [justAdded, setJustAdded] = useState('');

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

  // Status, forwarding addresses and the catch-all all come out of the same
  // Cloudflare zone, so they arrive together — three separate calls each made
  // the backend re-resolve ownership and re-sync the mirror.
  const { data: overview, isLoading: emailLoading, error: emailError } = useQuery({
    queryKey: overviewKey(domain),
    queryFn: async () => (await getSiteEmailOverview({ path: { domain }, throwOnError: true })).data,
    enabled: zoneActive,
    retry: false,
    // Cloudflare only marks a destination verified once its owner clicks the
    // link it emailed them, which happens outside this tab. Poll while any
    // inbox is still waiting, not just the first.
    refetchInterval: (query) =>
      query.state.data?.status?.destinations?.some((d) => !d.verified) ? 10000 : false,
  });

  const email = overview?.status;
  const routes = overview?.routes;
  const catchAll = overview?.catchAll;
  const destinations = email?.destinations ?? [];
  const verifiedDestinations = destinations.filter((d) => d.verified).map((d) => d.address);
  // One usable inbox is enough to unlock the rest of the page; the others can
  // still be verifying.
  const verified = verifiedDestinations.length > 0;

  // Roster emails are offered as one-click suggestions only — registering them
  // automatically would mail verification links to people who never asked.
  // Solo accounts have no firm and this 404s, hence retry: false.
  const { data: firm } = useQuery({
    queryKey: ['my-firm'],
    queryFn: async () => (await getMyFirm({ throwOnError: true })).data,
    enabled: zoneActive,
    retry: false,
  });

  const known = new Set(destinations.map((d) => d.address.toLowerCase()));
  const suggestions = (firm?.roster ?? [])
    .map((member) => member.email)
    .filter((address): address is string => !!address && !known.has(address.toLowerCase()));

  // Default to the first usable inbox so the form is submittable on arrival.
  // A pick that has since been removed (or lost its verification) falls back
  // rather than posting an address Cloudflare no longer knows.
  const routeDestination =
    (verifiedDestinations.includes(routeTarget) ? routeTarget : '') || verifiedDestinations[0] || '';

  // What the catch-all Select shows: the user's pick, else whatever Cloudflare
  // already forwards to, else the first usable inbox.
  const catchAllDestination =
    (verifiedDestinations.includes(catchAllTarget) ? catchAllTarget : '') ||
    catchAll?.destination ||
    verifiedDestinations[0] ||
    '';

  const invalidateOverview = () => queryClient.invalidateQueries({ queryKey: overviewKey(domain) });
  const patchOverview = (update: (old: SiteEmailOverview) => SiteEmailOverview) =>
    queryClient.setQueryData(overviewKey(domain), (old: SiteEmailOverview | undefined) =>
      old ? update(old) : old
    );

  // Cleared once the animation is done so a later re-render does not replay it.
  const flagAdded = (id: string) => {
    setJustAdded(id);
    setTimeout(() => setJustAdded((current) => (current === id ? '' : current)), 400);
  };

  // Both create calls return the row they just made, so paint it straight into
  // the cache. Invalidating alone means the UI waits a full round trip to show
  // something we already have in hand.
  const putEmail = (status: SiteEmail) => patchOverview((old) => ({ ...old, status }));
  const putRoutes = (update: (old: SiteEmailRoute[]) => SiteEmailRoute[]) =>
    patchOverview((old) => ({ ...old, routes: update(old.routes) }));

  const enableMutation = useMutation({
    mutationFn: async (destination: string) =>
      (await enableSiteEmail({ path: { domain }, body: { destination }, throwOnError: true })).data,
    onSuccess: (data, address) => {
      putEmail(data);
      flagAdded(address.toLowerCase());
      invalidateOverview();
      setDestinationInput('');
      toast.success('Check that inbox for Cloudflare\'s verification link.');
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not enable email forwarding')),
  });

  const removeDestinationMutation = useMutation({
    mutationFn: (address: string) =>
      removeSiteEmailDestination({ path: { domain, address }, throwOnError: true }),
    onSuccess: (_result, address) => {
      patchOverview((old) => ({
        ...old,
        status: { ...old.status, destinations: old.status.destinations.filter((d) => d.address !== address) },
      }));
      invalidateOverview();
      toast.success('Inbox removed');
    },
    // A 400 here names the addresses still forwarding to it, which is exactly
    // what the user needs to read.
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not remove that inbox')),
  });

  const addRouteMutation = useMutation({
    mutationFn: async (part: string) =>
      (await createSiteEmailRoute({
        path: { domain },
        body: { localPart: part, destination: routeDestination },
        throwOnError: true,
      })).data,
    onSuccess: (route) => {
      putRoutes((old) => [...old, route]);
      flagAdded(route.tag);
      invalidateOverview();
      setLocalPart('');
      setRouteTarget('');
      toast.success('Address added');
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not add that address')),
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (tag: string) => deleteSiteEmailRoute({ path: { domain, tag }, throwOnError: true }),
    onSuccess: (_result, tag) => {
      putRoutes((old) => old.filter((route) => route.tag !== tag));
      invalidateOverview();
      toast.success('Address removed');
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, 'Could not remove that address')),
  });

  const catchAllMutation = useMutation({
    mutationFn: ({ enabled, destination }: { enabled: boolean; destination: string }) =>
      setSiteEmailCatchAll({
        path: { domain },
        // The destination is ignored when disabling, but the schema still
        // wants the field, so send the chosen inbox either way.
        body: { enabled, destination },
        throwOnError: true,
      }),
    onSuccess: () => invalidateOverview(),
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

  if (!emailEnabled) return <ComingSoonOverlay title="Email Forwarding" description="Forward mail from your domain to an inbox you already use.">{shell(null)}</ComingSoonOverlay>;

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
          <CardTitle className="text-lg">Destination inboxes</CardTitle>
          <CardDescription>
            The inboxes mail sent to this domain can end up in. Each one is verified separately by
            Cloudflare.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {destinations.length > 0 && (
            <div className="flex flex-col gap-2">
              {destinations.map((destination) => (
                <div
                  key={destination.address}
                  className={`flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-xl border border-border/50 ${
                    destination.address.toLowerCase() === justAdded ? enterRowClass : ''
                  }`}
                >
                  <code className="text-xs font-mono break-all">{destination.address}</code>
                  <span className="flex items-center gap-2 shrink-0">
                    {destination.verified ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-success">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Awaiting verification
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${destination.address}`}
                      onClick={() => removeDestinationMutation.mutate(destination.address)}
                      disabled={
                        removeDestinationMutation.isPending &&
                        removeDestinationMutation.variables === destination.address
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          )}

          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (destinationInput.trim()) enableMutation.mutate(destinationInput.trim());
            }}
          >
            <div className="grid gap-2 flex-1">
              <Label htmlFor="destination">
                {destinations.length > 0 ? 'Add another inbox' : 'Your existing email address'}
              </Label>
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
              {destinations.length > 0 ? 'Add inbox' : 'Enable forwarding'}
            </Button>
          </form>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">From your firm:</span>
              {suggestions.map((address) => (
                <button
                  key={address}
                  type="button"
                  onClick={() => setDestinationInput(address)}
                  className="px-2 py-1 rounded-full border border-border/50 bg-muted/30 text-[11px] font-mono hover:bg-muted"
                >
                  {address}
                </button>
              ))}
            </div>
          )}

          {destinations.some((d) => !d.verified) && (
            <Alert variant="accent">
              <Mail className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Check your inbox</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Cloudflare emailed a verification link to{' '}
                {destinations.filter((d) => !d.verified).map((d) => d.address).join(', ')}. An inbox can
                only receive forwarded mail once its link is clicked — this page checks every 10 seconds.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className={`border-none shadow-premium ${verified ? '' : 'opacity-50 pointer-events-none'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Addresses</CardTitle>
          <CardDescription>Each address forwards to the inbox you pick.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {routes && routes.length > 0 ? (
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
                  <TableRow key={route.tag} className={route.tag === justAdded ? enterRowClass : undefined}>
                    <TableCell className="font-mono text-xs">{route.address}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {route.destination}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${route.address}`}
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
          ) : (
            <p className="text-xs text-muted-foreground">
              No forwarding addresses yet. Add one below — <span className="font-mono">contact</span> is a
              good start.
            </p>
          )}

          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (localPart.trim() && routeDestination) addRouteMutation.mutate(localPart.trim());
            }}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end">
              <div className="grid gap-2">
                <Label htmlFor="localPart">New address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="localPart"
                    placeholder="contact"
                    value={localPart}
                    onChange={(e) => setLocalPart(e.target.value)}
                    className="min-w-0"
                  />
                  {/* The suffix is the one part that must stay whole — the
                      input gives up width instead of the domain truncating. */}
                  <span className="text-sm text-muted-foreground font-mono shrink-0 whitespace-nowrap">
                    @{domain}
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="route-destination">Forwards to</Label>
                <Select value={routeDestination} onValueChange={setRouteTarget}>
                  <SelectTrigger id="route-destination" className="font-mono text-xs [&>span]:truncate">
                    <SelectValue placeholder="Pick an inbox" />
                  </SelectTrigger>
                  <SelectContent>
                    {verifiedDestinations.map((address) => (
                      <SelectItem key={address} value={address} className="font-mono text-xs">
                        {address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                variant="outline"
                className="gap-2 shrink-0"
                disabled={addRouteMutation.isPending || !routeDestination}
              >
                {addRouteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>

            {destinations.some((d) => !d.verified) && (
              <span className="text-[11px] text-muted-foreground">
                Inboxes still awaiting verification can&apos;t be picked yet.
              </span>
            )}
          </form>


          {routes && routes.length > 0 && <SendAsGuide addresses={routes.map((route) => route.address)} />}
        </CardContent>
      </Card>

      <Card className={`border-none shadow-premium ${verified ? '' : 'opacity-50 pointer-events-none'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Catch-all</CardTitle>
          <CardDescription>
            Forward mail sent to any other address on {domain}. With this off, such mail is rejected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <Label htmlFor="catch-all" className="font-medium">
            Forward everything else to
          </Label>
          <div className="flex items-center gap-4">
            <Select
              value={catchAllDestination}
              onValueChange={(address) => {
                setCatchAllTarget(address);
                // Repointing an enabled catch-all takes effect immediately;
                // when it is off the choice is just remembered for the toggle.
                if (catchAll?.enabled) catchAllMutation.mutate({ enabled: true, destination: address });
              }}
            >
              <SelectTrigger className="w-[240px] font-mono text-xs">
                <SelectValue placeholder="Pick an inbox" />
              </SelectTrigger>
              <SelectContent>
                {verifiedDestinations.map((address) => (
                  <SelectItem key={address} value={address} className="font-mono text-xs">
                    {address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Switch
              id="catch-all"
              checked={!!catchAll?.enabled}
              disabled={catchAllMutation.isPending || !catchAllDestination}
              onCheckedChange={(checked) =>
                catchAllMutation.mutate({ enabled: checked, destination: catchAllDestination })
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
