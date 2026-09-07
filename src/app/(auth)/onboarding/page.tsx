'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAccountType } from '@/generated/wokil-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Scale, Building2, ArrowRight, Loader2 } from 'lucide-react';

type AccountType = 'individual' | 'firm';

const CHOICES: {
  type: AccountType;
  icon: React.ReactNode;
  title: string;
  blurb: string;
  points: string[];
  href: string;
}[] = [
  {
    type: 'individual',
    icon: <Scale className="w-7 h-7" />,
    title: "I'm an individual lawyer",
    blurb: 'A personal site built around your own practice, experience and credentials.',
    points: ['Your profile and career timeline', 'Your own address, e.g. yourname.wokil.com'],
    href: '/profile-builder',
  },
  {
    type: 'firm',
    icon: <Building2 className="w-7 h-7" />,
    title: "I'm setting up a firm",
    blurb: "A site for the firm itself, with a directory of the lawyers who work there.",
    points: ['Firm details and practice areas', 'A roster of your lawyers on one site'],
    href: '/firm-builder',
  },
];

/**
 * The fork in onboarding, immediately after sign-in.
 *
 * A screen of its own rather than a step inside either wizard: the answer picks
 * which wizard you get, so it cannot live inside one of them. Reachable only
 * while users.account_type is null — the Google callback routes here on that
 * basis, and picking either option fills it in.
 */
export default function OnboardingChoice() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState<AccountType | null>(null);

  const choose = async (type: AccountType, href: string) => {
    setPending(type);
    try {
      await setAccountType({ body: { accountType: type }, throwOnError: true });
      router.push(href);
    } catch (error) {
      console.error('Failed to set account type', error);
      toast({
        title: 'Something went wrong',
        description: "We couldn't save that choice. Please try again.",
        variant: 'destructive',
      });
      setPending(null);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <h1 className="heading-section text-3xl md:text-4xl text-foreground">
            How will you be using Wokil?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This decides what we ask you for next. You can change it later, but starting in the
            right place saves you re-entering things.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {CHOICES.map(({ type, icon, title, blurb, points, href }) => {
            const isPending = pending === type;
            return (
              <Card
                key={type}
                role="button"
                tabIndex={0}
                aria-busy={isPending}
                onClick={() => !pending && choose(type, href)}
                onKeyDown={(e) => {
                  if (pending) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose(type, href);
                  }
                }}
                className={`group p-8 flex flex-col gap-5 cursor-pointer border-border shadow-premium transition-all hover:border-primary/40 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  pending && !isPending ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  {icon}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{blurb}</p>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="ghost"
                  className="mt-auto self-start gap-2 px-0 label-caps text-xs text-primary hover:bg-transparent hover:text-primary"
                  disabled={Boolean(pending)}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
