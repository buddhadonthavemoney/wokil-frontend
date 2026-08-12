/**
 * Which wizard steps are closed, and where the wizard therefore ends.
 *
 * A step goes locked when the thing it edits can no longer change — today that
 * is the subdomain, which is frozen once a site is deployed. The step stays in
 * the progress bar (the live address is worth seeing) but stops being somewhere
 * the wizard sends you.
 *
 * Both the wizard shell and the builder pages ask this same question, so the
 * answer lives in one place rather than being derived twice and left to drift:
 * if they disagree, the finish button breaks.
 */

/** The highest step still reachable, skipping any that are locked. */
export function lastReachableStep(totalSteps: number, locked: readonly number[]): number {
  for (let step = totalSteps; step >= 1; step--) {
    if (!locked.includes(step)) return step;
  }
  // Every step locked isn't a state the wizards can produce, but a wizard with
  // no steps at all is worse than one parked on its first.
  return 1;
}
