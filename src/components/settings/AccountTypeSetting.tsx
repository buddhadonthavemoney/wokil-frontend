'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Scale, Building2, UserCog, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  getAccountTypeOptions,
  setAccountTypeMutation,
} from '@/generated/wokil-api/@tanstack/react-query.gen';

type AccountType = 'individual' | 'firm';

const LABELS: Record<AccountType, { title: string; blurb: string; icon: React.ReactNode }> = {
  individual: {
    title: 'Individual lawyer',
    blurb: 'You build a personal site around your own practice.',
    icon: <Scale className="w-5 h-5" />,
  },
  firm: {
    title: 'Firm',
    blurb: "You build the firm's site, with a roster of its lawyers.",
    icon: <Building2 className="w-5 h-5" />,
  },
};

/**
 * Switches the account between individual and firm.
 *
 * The same choice the onboarding screen makes, exposed again because it is
 * genuinely reversible — it selects which profile you edit and which site
 * "Publish" targets, and destroys nothing on either side.
 */
export function AccountTypeSetting() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingChoice, setPendingChoice] = useState<AccountType | null>(null);

  const { data, isLoading } = useQuery(getAccountTypeOptions());
  const current = (data?.accountType ?? null) as AccountType | null;

  const mutation = useMutation({
    ...setAccountTypeMutation(),
    onSuccess: (_result, variables) => {
      const chosen = variables.body.accountType as AccountType;
      queryClient.invalidateQueries();
      toast({
        title: 'Account type updated',
        description:
          chosen === 'firm'
            ? "You're now set up as a firm. Publishing updates your firm's site."
            : "You're now set up as an individual lawyer. Publishing updates your personal site.",
      });
      setPendingChoice(null);
      router.push(chosen === 'firm' ? '/firm-builder' : '/profile-builder');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: "We couldn't change your account type. Please try again.",
        variant: 'destructive',
      });
      setPendingChoice(null);
    },
  });

  const other: AccountType = current === 'firm' ? 'individual' : 'firm';

  return (
    <div className="bg-card border-none rounded-xl p-8 shadow-premium space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/5 rounded-lg">
          <UserCog className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Account Type</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Whether you build a personal site or a firm&apos;s site.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold flex items-center gap-2">
                <span className="text-primary">{current ? LABELS[current].icon : null}</span>
                {current ? LABELS[current].title : 'Not chosen yet'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {current ? LABELS[current].blurb : 'Pick how you want to use Wokil.'}
              </p>
            </div>

            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setPendingChoice(other)}
              className="gap-2"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Switch to {LABELS[other].title.toLowerCase()}
            </Button>
          </div>

          {/*
            Stated up front, not only in the confirmation dialog: someone
            deciding whether to click needs to know what it costs before they
            reach for it.
          */}
          <div className="flex gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4">
            <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="text-xs text-foreground leading-relaxed space-y-1">
              <p className="font-bold">Switching changes what you edit and what you publish.</p>
              <p>
                Nothing is deleted — your personal profile and your firm both stay exactly as they
                are, and any site you have already published stays online. But the builder, the
                dashboard and the <strong>Publish</strong> button all follow your account type, so
                after switching they act on the other one. Switch back at any time to return.
              </p>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={pendingChoice !== null}
        onOpenChange={(open) => !open && setPendingChoice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Switch to {pendingChoice ? LABELS[pendingChoice].title.toLowerCase() : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {pendingChoice === 'firm'
                    ? "You'll start building your firm's site instead of your personal one. If you don't have a firm yet, we'll take you through setting one up."
                    : "You'll go back to building your personal lawyer site instead of your firm's."}
                </p>
                <p>
                  Your existing{' '}
                  {pendingChoice === 'firm' ? 'personal profile' : 'firm and its roster'} will be
                  kept, and any site you have already published will stay online — but{' '}
                  <strong>Publish</strong> will no longer update it until you switch back.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(e) => {
                // Keep the dialog up while the request is in flight, so the
                // action cannot be fired twice from a dialog that looks closed.
                e.preventDefault();
                if (pendingChoice) {
                  mutation.mutate({ body: { accountType: pendingChoice } });
                }
              }}
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
