'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAccountTypeOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';

export type AccountType = 'individual' | 'firm';

/**
 * The signed-in user's account type.
 *
 * The Google callback checks this once to decide whether to show the
 * onboarding fork, but the choice matters on every page after that too: an
 * individual's data lives behind `getProfile`, a firm's behind `getMyFirm`,
 * and a page that assumes the wrong one renders an empty shell rather than an
 * error. Cached by react-query, so the extra pages cost no extra requests.
 */
export function useAccountType() {
  const { data, isLoading } = useQuery(getAccountTypeOptions());
  return {
    accountType: data?.accountType as AccountType | undefined,
    isLoading,
  };
}

/**
 * Sends the caller somewhere else when this page belongs to the other account
 * type. Returns `redirecting` so the page can hold its loading state instead
 * of flashing the wrong content on the way out.
 *
 * Deliberately only redirects on a *known* mismatch: while the type is loading,
 * or if the lookup fails and it stays undefined, the page renders as-is. A
 * failed request must never bounce someone out of their own dashboard.
 */
export function useRequireAccountType(required: AccountType, elsewhere: string) {
  const router = useRouter();
  const { accountType, isLoading } = useAccountType();
  const mismatched = accountType !== undefined && accountType !== required;

  useEffect(() => {
    if (mismatched) router.replace(elsewhere);
  }, [mismatched, elsewhere, router]);

  return { redirecting: mismatched, isLoading };
}
