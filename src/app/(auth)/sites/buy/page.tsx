'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  Loader2,
  MailWarning,
  Search,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import {
  searchDomains,
  getRegistrant,
  saveRegistrant,
  resendRegistrantVerification,
  createDomainOrder,
  getDomainOrder,
  listSites,
} from '@/generated/wokil-api';
import type { DomainOrder, DomainSuggestion, Registrant, RegistrantResponse } from '@/generated/wokil-api';
import { getProfileQueryKey } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressIndicator } from '@/components/form/ProgressIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn, siteHref } from '@/lib/utils';
import { apiErrorMessage, rateLimitError } from '@/lib/client-ui';
import { toast } from 'sonner';
import { useFeatureEnabled } from '@/hooks/useFeatures';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { useDeployStream } from '@/hooks/useDeployStream';
import { DeployProgressModal } from '@/components/deploy/DeployProgressModal';

const STEPS = ['Search', 'Registrant', 'Review', 'Payment', 'Go live'];

// Where to send proof of a manual payment. An env override so a deployment
// that isn't wokil.app doesn't send its customers to our inbox.
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@wokil.app';

// Prices arrive in minor units, and how many of those make a major unit is a
// property of the currency (USD 100, JPY 1) — ask Intl rather than assuming
// cents. An unknown code makes Intl throw, which is not worth a crash.
const money = (amount: number, currency: string) => {
  try {
    const format = new Intl.NumberFormat(undefined, { style: 'currency', currency });
    const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
    return format.format(amount / 10 ** digits);
  } catch {
    return `${amount} ${currency}`;
  }
};

// The API rejects a registrant with `invalid registrant: <field> <problem>`
// (fieldErr in registrant.go), so the offending field is the first word after
// the colon. Validation is authoritative server-side; this only decides which
// input to outline.
const parseFieldError = (message: string): { field: string; message: string } | null => {
  const match = /invalid registrant:\s*([a-z_]+)\s+([\s\S]+)/i.exec(message);
  if (!match) return null;
  return { field: match[1], message: `${match[1].replace(/_/g, ' ')} ${match[2]}`.trim() };
};

// A registrar quotes a one-year creation price; ordering longer would multiply
// a number nobody quoted, so the API supports 1 and this sends nothing else.
const PERIOD_YEARS = 1;

// Everything RegistrantResponse adds on top of the Registrant the PUT accepts.
const toRegistrantForm = (r: RegistrantResponse): Registrant => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured off, not read
  const { saved, email_verified, email_verification_status, icann_verified_at, ...rest } = r;
  return rest;
};

const REQUIRED_FIELDS: Array<keyof Registrant> = [
  'first_name',
  'last_name',
  'email',
  'phone_country_code',
  'phone_subscriber_number',
  'street',
  'house_number',
  'zipcode',
  'city',
  'country',
];

function BuyDomainContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  // The order id lives in the URL, which is what makes a half-finished
  // purchase survive a closed tab: the status decides the step, so returning
  // to this link lands wherever the order actually got to.
  const orderId = Number(searchParams?.get('order')) || 0;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selected, setSelected] = useState<DomainSuggestion | null>(null);
  const [localStep, setLocalStep] = useState(1);
  // Local edits, layered over the fetched registrant below. Null until the
  // user types, so a refetch cannot clobber a half-filled form.
  const [draft, setDraft] = useState<Registrant | null>(null);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  // Set once the stream reaches a terminal state, so `active` cannot flip back
  // on and restart the deploy the next time the order is polled.
  const [deployFinished, setDeployFinished] = useState(false);

  // Drives the cooldown countdown, and only ticks while one is running.
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (now >= cooldownUntil) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - nowMs) / 1000));

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(id);
  }, [query]);

  const orderQuery = useQuery({
    queryKey: ['domain-order', orderId],
    queryFn: async () => (await getDomainOrder({ path: { orderId }, throwOnError: true })).data,
    enabled: orderId > 0,
    // An administrator confirms the payment out of band and registration then
    // runs on the backend, so nothing client-side can know when to look —
    // poll while the order is still moving, stop once it has landed.
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status === 'pending_payment' || status === 'paid' || status === 'registering' ? 10000 : false;
    },
  });
  const order = orderQuery.data;

  const registrantQuery = useQuery({
    queryKey: ['registrant'],
    queryFn: async () => (await getRegistrant({ throwOnError: true })).data,
  });
  const registrant = registrantQuery.data;

  const form = draft ?? (registrant ? toRegistrantForm(registrant) : null);

  const searchResults = useQuery({
    queryKey: ['domain-search', debouncedQuery],
    enabled: debouncedQuery.length > 0 && cooldownSeconds === 0 && orderId === 0,
    retry: false,
    queryFn: async () => {
      // Not `throwOnError: true`: that discards the response, and the 429
      // carries its cooldown in Retry-After.
      const { data, error, response } = await searchDomains({ body: { query: debouncedQuery } });
      if (!response) throw new Error('Could not reach the server. Check your connection and try again.');
      if (response.status === 429) {
        // Mirror the server's window client-side so the box stays disabled
        // instead of re-enabling into a guaranteed second refusal.
        const limit = rateLimitError(response, error);
        setCooldownUntil(Date.now() + limit.retryAfterSeconds * 1000);
        throw limit;
      }
      if (!response.ok) {
        throw new Error(typeof error === 'string' && error ? error : 'Could not search for domains.');
      }
      return data!;
    },
  });

  const saveRegistrantMutation = useMutation({
    mutationFn: async (body: Registrant) => (await saveRegistrant({ body, throwOnError: true })).data,
    onSuccess: (data) => {
      queryClient.setQueryData(['registrant'], data);
      setDraft(null);
      setFieldError(null);
      setLocalStep(3);
    },
    onError: (error: unknown) => {
      const message = apiErrorMessage(error, 'Could not save your details.');
      setFieldError(parseFieldError(message));
      toast.error(message);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (domain: string) =>
      (await createDomainOrder({ body: { domain, period_years: PERIOD_YEARS }, throwOnError: true })).data,
    onSuccess: (data) => {
      queryClient.setQueryData(['domain-order', data.id], data);
      // The sites list caches orders for 30s, which is long enough to walk
      // back there and not see the purchase you just made.
      queryClient.invalidateQueries({ queryKey: ['domain-orders'] });
      // Into the URL rather than into state, so this step is reachable again
      // after the tab is closed.
      router.replace(`/sites/buy?order=${data.id}`);
    },
    onError: (error: unknown) => {
      const message = apiErrorMessage(error, 'Could not place your order.');
      // `saved` only means a row exists — the order also needs the registrant
      // to have reached the registrar, which the API does not expose
      // separately. Recover by sending them back to save it for real rather
      // than leaving a dead "Place the order" button.
      if (/registrant/i.test(message)) {
        setDraft(form);
        setLocalStep(2);
      }
      toast.error(message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { error, response } = await resendRegistrantVerification();
      if (!response) throw new Error('Could not reach the server. Check your connection and try again.');
      if (response.status === 429) throw rateLimitError(response, error);
      if (!response.ok) {
        throw new Error(typeof error === 'string' && error ? error : 'Could not send the verification email.');
      }
    },
    onSuccess: () => toast.success('Verification email sent. Check your inbox, including spam.'),
    onError: (error: Error) => toast.error(error.message),
  });

  // The backend creates the site row and starts the deploy itself once the
  // domain is registered; the stream only attaches to progress already being
  // made, so the go-live screen matches the connect-a-domain flow.
  const deployDomain = order?.status === 'registered' ? order.domain : null;

  const deployStream = useDeployStream({
    active: deployDomain !== null && !deployFinished,
    onDeactivate: () => setDeployFinished(true),
    // Registration hands off to a deploy only when the new zone is already
    // active at Cloudflare; otherwise the site waits in link_pending — the
    // common case for a name registered seconds ago — and there is no stream
    // to read. That is neither a finished deployment nor a failed one, so it
    // closes the modal rather than reporting either.
    confirmAlreadyDone: async () => {
      if (!deployDomain) return 'idle';
      const { data } = await listSites({ throwOnError: true });
      return data?.some((site) => site.domain === deployDomain && site.status === 'deployed')
        ? true
        : 'idle';
    },
    onDone: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: getProfileQueryKey() });
    },
  });

  const step = order
    ? order.status === 'pending_payment'
      ? 4
      : 5
    : localStep;

  // Nothing typed on top of an already-saved registrant.
  const unchanged = !!registrant?.saved && draft === null;
  const missingFields = form ? REQUIRED_FIELDS.filter((f) => !String(form[f] ?? '').trim()) : REQUIRED_FIELDS;
  const canOrder = !!registrant?.saved && !!selected;

  const setField = (field: keyof Registrant, value: string) => {
    if (form) setDraft({ ...form, [field]: value });
    if (fieldError?.field === field) setFieldError(null);
  };

  const fieldClass = (field: keyof Registrant) =>
    cn(fieldError?.field === field && 'border-destructive focus-visible:ring-destructive');

  const renderField = (
    field: keyof Registrant,
    label: string,
    opts: { placeholder?: string; optional?: boolean; hint?: string; type?: string } = {}
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>
        {label}
        {opts.optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </Label>
      <Input
        id={field}
        type={opts.type}
        placeholder={opts.placeholder}
        autoComplete="off"
        value={String(form?.[field] ?? '')}
        onChange={(e) => setField(field, e.target.value)}
        className={fieldClass(field)}
        aria-invalid={fieldError?.field === field || undefined}
        aria-describedby={opts.hint ? `${field}-hint` : undefined}
      />
      {opts.hint && (
        <p id={`${field}-hint`} className="text-xs text-muted-foreground">
          {opts.hint}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-2 text-muted-foreground"
              onClick={() => router.push('/sites')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sites
            </Button>
            <PageHeader
              icon={<ShoppingCart />}
              title="Buy a domain"
              description="Search for a name, tell us who owns it, and we register it for you."
            />
          </div>

          <ProgressIndicator
            currentStep={step}
            totalSteps={STEPS.length}
            steps={STEPS}
            // Only the steps before an order exists can be revisited — once the
            // order is placed the domain and price are fixed on the server.
            onStepClick={order ? undefined : (n) => n < localStep && setLocalStep(n)}
            lockedSteps={order ? [1, 2, 3] : []}
          />

          {/* An unverified registrant email suspends a working domain 15 days
              after it is registered, so it is surfaced on every step. */}
          {registrant?.saved && !registrant.email_verified && (
            <Alert variant="destructive">
              <MailWarning className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Confirm your email address</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 text-xs">
                <span>
                  ICANN requires you to confirm <strong>{registrant.email}</strong>. A registered domain is
                  suspended if this is not done within 15 days
                  {order?.registered_at && (
                    <> — by {new Date(new Date(order.registered_at).getTime() + 15 * 864e5).toLocaleDateString()}</>
                  )}
                  .{registrant.email_verification_status && <> Registrar status: {registrant.email_verification_status}.</>}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-2"
                  disabled={resendMutation.isPending}
                  onClick={() => resendMutation.mutate()}
                >
                  {resendMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Resend the email
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-none bg-card shadow-premium">
            <CardContent className="p-6 sm:p-8">
              {/* `step` falls back to 1 while an order is still loading, which
                  would stack a dead search box above "Loading your order…". */}
              {step === 1 && orderId === 0 && (
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="domain-search">What should your domain be called?</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="domain-search"
                        className="pl-9"
                        placeholder="sharmalaw"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A name on its own is enough — we check it against every extension we sell.
                    </p>
                  </div>

                  {cooldownSeconds > 0 ? (
                    <Alert variant="accent">
                      <Clock className="h-4 w-4" />
                      <AlertTitle className="text-sm font-semibold">Just a moment</AlertTitle>
                      <AlertDescription className="text-xs">
                        You have searched a few times in quick succession. Try again in {cooldownSeconds}s.
                      </AlertDescription>
                    </Alert>
                  ) : searchResults.isFetching ? (
                    <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking availability…
                    </div>
                  ) : searchResults.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">{searchResults.error.message}</AlertDescription>
                    </Alert>
                  ) : (
                    searchResults.data && (
                      <div className="flex flex-col gap-2">
                        {searchResults.data.results.length === 0 && (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            Nothing available for that name. Try a different one.
                          </p>
                        )}
                        {searchResults.data.results.map((result) => {
                          const isSelected = selected?.domain === result.domain;
                          return (
                            <div
                              key={result.domain}
                              className={cn(
                                'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-4 transition-colors',
                                result.available ? 'bg-card hover:border-accent/50' : 'bg-muted/30',
                                isSelected && 'border-accent bg-accent/5'
                              )}
                            >
                              <div className="flex min-w-0 flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="truncate font-semibold">{result.domain}</span>
                                  {result.premium && (
                                    <Badge
                                      variant="outline"
                                      className="border-accent/30 bg-accent/10 text-[10px] text-accent-foreground"
                                    >
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                {!result.available && (
                                  <span className="text-xs text-muted-foreground">
                                    {result.unavailable_reason === 'on_wokil'
                                      ? 'Already in use by another Wokil site.'
                                      : 'Someone already owns this one.'}
                                  </span>
                                )}
                                {result.premium && result.available && (
                                  <span className="text-xs text-muted-foreground">
                                    An aftermarket name — priced well above a standard registration.
                                  </span>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                {result.available && result.price_amount !== undefined && result.price_currency && (
                                  <span className="text-sm font-semibold">
                                    {money(result.price_amount, result.price_currency)}
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">/year</span>
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant={isSelected ? 'default' : 'outline'}
                                  disabled={!result.available}
                                  onClick={() => {
                                    setSelected(result);
                                    setLocalStep(2);
                                  }}
                                  className="gap-2"
                                >
                                  {isSelected && <Check className="h-3.5 w-3.5" />}
                                  {isSelected ? 'Selected' : 'Choose'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        <p className="pt-2 text-xs text-muted-foreground">
                          Prices are quotes. We re-check with the registrar when you order, and the order shows the
                          amount you will actually pay.
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-heading text-lg font-bold">Who owns the domain?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      These details go on the public WHOIS record and are what the registry checks. They belong to
                      you, not to Wokil.
                    </p>
                  </div>

                  {registrantQuery.isLoading || !form ? (
                    <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading your details…
                    </div>
                  ) : (
                    <form
                      className="flex flex-col gap-6"
                      onSubmit={(e) => {
                        e.preventDefault();
                        // Saving re-syncs the registrar, which can fail upstream.
                        // An untouched form has nothing to sync, so moving on
                        // must not depend on that call succeeding.
                        if (unchanged) {
                          setLocalStep(3);
                          return;
                        }
                        saveRegistrantMutation.mutate(form);
                      }}
                    >
                      {!registrant?.saved && (
                        <Alert variant="accent">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-sm font-semibold">Your address is not prefilled</AlertTitle>
                          <AlertDescription className="text-xs">
                            Your name, email and phone came from your profile. The address fields are empty on
                            purpose: your profile stores an address as one line of text, and a registry needs it
                            split into street, number, city and postcode. Please type it out once — we keep it for
                            next time.
                          </AlertDescription>
                        </Alert>
                      )}

                      {fieldError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-sm font-semibold">Check this field</AlertTitle>
                          <AlertDescription className="text-xs first-letter:uppercase">
                            {fieldError.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        {renderField('first_name', 'First name')}
                        {renderField('last_name', 'Last name')}
                      </div>

                      {renderField('company_name', 'Company name', {
                        optional: true,
                        hint: 'Fill this in to register the domain to your firm rather than to you personally. It cannot be changed later.',
                      })}

                      {renderField('email', 'Email', {
                        type: 'email',
                        hint: 'The ICANN confirmation goes here. It must be an inbox you can open.',
                      })}

                      <div className="grid gap-4 sm:grid-cols-3">
                        {renderField('phone_country_code', 'Country code', { placeholder: '+977' })}
                        {renderField('phone_area_code', 'Area code', { placeholder: '1', optional: true })}
                        {renderField('phone_subscriber_number', 'Phone number', { placeholder: '4412345' })}
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        {renderField('street', 'Street', { placeholder: 'Durbar Marg' })}
                        {renderField('house_number', 'House number', { placeholder: '12' })}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        {renderField('zipcode', 'Postcode', { placeholder: '44600' })}
                        {renderField('city', 'City', { placeholder: 'Kathmandu' })}
                        {renderField('state', 'State or province', { placeholder: 'Bagmati', optional: true })}
                      </div>

                      {renderField('country', 'Country code', {
                        placeholder: 'NP',
                        hint: 'Two letters, as ISO 3166-1 writes them — GB rather than UK.',
                      })}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button type="button" variant="ghost" onClick={() => setLocalStep(1)}>
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={saveRegistrantMutation.isPending || missingFields.length > 0}
                          className="gap-2"
                        >
                          {saveRegistrantMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          {unchanged ? 'Continue' : 'Save and continue'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-heading text-lg font-bold">Check the details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Placing the order does not charge you. We will tell you how to pay next.
                    </p>
                  </div>

                  {!selected ? (
                    <div className="flex flex-col items-start gap-4 py-4">
                      <p className="text-sm text-muted-foreground">You have not picked a domain yet.</p>
                      <Button variant="outline" onClick={() => setLocalStep(1)}>
                        Back to search
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{selected.domain}</span>
                          <span className="text-xs text-muted-foreground">
                            {PERIOD_YEARS} year registration
                            {selected.premium && ' · premium name'}
                          </span>
                        </div>
                        {selected.price_amount !== undefined && selected.price_currency && (
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {money(selected.price_amount, selected.price_currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">quoted price</div>
                          </div>
                        )}
                      </div>

                      {registrant && (
                        <div className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 text-sm">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Registered to
                          </span>
                          <span>
                            {registrant.first_name} {registrant.last_name}
                            {registrant.company_name && ` · ${registrant.company_name}`}
                          </span>
                          <span className="text-muted-foreground">{registrant.email}</span>
                          <span className="text-muted-foreground">
                            {[registrant.house_number, registrant.street, registrant.city, registrant.zipcode, registrant.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                          <Button
                            variant="link"
                            className="h-auto w-fit p-0 text-xs"
                            onClick={() => setLocalStep(2)}
                          >
                            Edit these details
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        We re-check the price with the registrar as the order is created, so the amount on the next
                        screen is the one that counts.
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button variant="ghost" onClick={() => setLocalStep(2)}>
                          Back
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={!canOrder || createOrderMutation.isPending}
                          onClick={() => createOrderMutation.mutate(selected.domain)}
                        >
                          {createOrderMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          Place the order
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 4 && order && (
                <PaymentStep order={order} quoted={selected} />
              )}

              {step === 5 && order && (
                <StatusStep order={order} onGoToSites={() => router.push('/sites')} />
              )}

              {/* Not `isLoading`: that is false between retry attempts and
                  while a retry is paused offline, which would leave the card
                  empty rather than still loading. */}
              {orderId > 0 && !order && !orderQuery.isError && (
                <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your order…
                </div>
              )}

              {orderId > 0 && orderQuery.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-semibold">We could not find that order</AlertTitle>
                  <AlertDescription className="text-xs">
                    {apiErrorMessage(orderQuery.error, 'It may belong to a different account.')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <DeployProgressModal
        phase={deployStream.phase}
        steps={deployStream.steps}
        message={deployStream.message}
        onClose={deployStream.reset}
        siteUrl={deployDomain ? siteHref(deployDomain) : undefined}
      />
    </div>
  );
}

// Step 4. Payment is manual in v1 — say so plainly rather than implying an
// automated checkout that does not exist.
function PaymentStep({ order, quoted }: { order: DomainOrder; quoted: DomainSuggestion | null }) {
  // Only meaningful in the session that placed the order; a resumed one has no
  // quote to compare against.
  const repriced =
    quoted?.domain === order.domain &&
    quoted.price_amount !== undefined &&
    quoted.price_amount !== order.price_amount;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-lg font-bold">How to pay</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your order for <strong className="text-foreground">{order.domain}</strong> is reserved. We register it as
          soon as your payment is confirmed.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount due</span>
          <span className="text-2xl font-bold">{money(order.price_amount, order.price_currency)}</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference</div>
          <div className="font-mono text-sm font-semibold">WOKIL-{order.id}</div>
        </div>
      </div>

      {repriced && quoted?.price_amount !== undefined && quoted.price_currency && (
        <Alert variant="accent">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">The price changed</AlertTitle>
          <AlertDescription className="text-xs">
            Search quoted {money(quoted.price_amount, quoted.price_currency)}. We re-checked with the registrar when
            you ordered, and the amount above is the one that applies.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What to do</span>
        <ol className="flex list-decimal flex-col gap-2 pl-4 text-muted-foreground">
          <li>
            Transfer <strong className="text-foreground">{money(order.price_amount, order.price_currency)}</strong>{' '}
            using the payment details your account manager gave you.
          </li>
          <li>
            Quote <strong className="text-foreground">WOKIL-{order.id}</strong> as the reference so we can match it
            to this order.
          </li>
          <li>
            Email your receipt to{' '}
            <a className="font-medium text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            .
          </li>
        </ol>
      </div>

      <Alert variant="accent">
        <Clock className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">A person checks this</AlertTitle>
        <AlertDescription className="text-xs">
          Payments are confirmed by hand, usually within one business day. You can close this page — this order stays
          on your sites list, and reopening it brings you back here. We will start registering the domain the moment
          the payment is confirmed.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Step 5. Everything after the money: registering, registered, or failed.
function StatusStep({ order, onGoToSites }: { order: DomainOrder; onGoToSites: () => void }) {
  if (order.status === 'failed') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-lg font-bold">We could not register {order.domain}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your payment is recorded and still stands — nothing has been lost.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">What went wrong</AlertTitle>
          <AlertDescription className="text-xs">
            {order.failure_reason || 'The registrar refused the registration and did not say why.'}
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          Our team can retry this for you. Email{' '}
          <a className="font-medium text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>{' '}
          quoting <strong className="text-foreground">WOKIL-{order.id}</strong>.
        </p>
        <Button variant="outline" className="w-fit" onClick={onGoToSites}>
          Back to sites
        </Button>
      </div>
    );
  }

  if (order.status === 'registered') {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <h2 className="font-heading text-lg font-bold">{order.domain} is yours</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The domain is registered and we are putting your site on it. If your site is not live immediately, the
              new domain is still switching on across the internet — that finishes on its own, usually within a few
              hours.
            </p>
          </div>
        </div>
        <Button className="w-fit gap-2" onClick={onGoToSites}>
          <Sparkles className="h-4 w-4" />
          Go to my sites
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
        <div>
          <h2 className="font-heading text-lg font-bold">Payment confirmed</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We are registering {order.domain} with the registrar. This usually takes a minute or two, and this page
            updates on its own.
          </p>
        </div>
      </div>
      <Button variant="outline" className="w-fit" onClick={onGoToSites}>
        Back to sites
      </Button>
    </div>
  );
}

export default function BuyDomainPage() {
  const { enabled } = useFeatureEnabled('domain_purchase');

  const content = (
    <Suspense fallback={null}>
      <BuyDomainContent />
    </Suspense>
  );

  if (!enabled) return <ComingSoonOverlay title="Buy a Domain" description="Search for a domain name and register it through us.">{content}</ComingSoonOverlay>;
  return content;
}
