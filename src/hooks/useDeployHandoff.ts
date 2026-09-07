'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDeployStream, type DeployStreamState } from '@/hooks/useDeployStream';

interface UseDeployHandoffOptions {
  /** Where the ?deploying=true navigation is stripped and replaced to. */
  redirectTo: string;
  /**
   * Fresh fetch answering "is the site live yet?". The stream's "no ongoing
   * deployment" 400 is ambiguous between "finished before we subscribed" and
   * "nothing was ever running"; only the site itself can tell the difference.
   */
  confirmPublished: () => Promise<boolean>;
  /** Runs on the terminal event, for failures too — a failed deploy can still
   *  have moved state the page renders. */
  onDone: (status: 'success' | 'failed', message: string) => void | Promise<void>;
}

/**
 * The `?deploying=true` handoff both dashboards share: the preview's publish
 * call has already returned and the work continues server-side, so arriving
 * here has to arm the deploy modal, consume the param (a refresh or a shared
 * URL must not reopen a modal over a deploy that already ended), and turn the
 * stream into visible progress.
 *
 * The param is read in the initializer rather than an effect: the preview
 * reaches these pages through a client-side router.push, so it is already
 * present on the first render, and arming in an effect would both cost a
 * render and race the strip below.
 */
export function useDeployHandoff({
  redirectTo,
  confirmPublished,
  onDone,
}: UseDeployHandoffOptions): DeployStreamState {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeDeployment, setActiveDeployment] = useState(
    () => searchParams?.get('deploying') === 'true',
  );

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get('deploying') !== 'true') return;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('deploying');
    const query = newParams.toString();
    router.replace(query ? `${redirectTo}?${query}` : redirectTo, { scroll: false });
  }, [searchParams, router, redirectTo]);

  return useDeployStream({
    active: activeDeployment,
    onDeactivate: () => setActiveDeployment(false),
    confirmAlreadyDone: confirmPublished,
    onDone,
  });
}