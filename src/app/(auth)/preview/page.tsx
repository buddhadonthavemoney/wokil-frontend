'use client';

import { Scale } from 'lucide-react';
import { useAccountType } from '@/hooks/useAccountType';
import { IndividualPreview } from './IndividualPreview';
import { FirmPreviewPage } from './FirmPreviewPage';

/**
 * One preview route, two account types.
 *
 * A dispatcher rather than a branch inside a single component: the two sides
 * read different form hooks (useProfileForm vs useFirmForm), and hooks cannot
 * be called conditionally — branching in one component would mean running
 * both, so every firm visit would also fetch and autosave a lawyer profile it
 * does not own.
 */
export default function Preview() {
  const { accountType, isLoading } = useAccountType();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Scale className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-xs label-caps text-muted-foreground animate-pulse">
          Loading Preview...
        </p>
      </div>
    );
  }

  // Unknown type (the lookup failed) falls through to the individual preview,
  // which is where everyone landed before firms existed.
  return accountType === 'firm' ? <FirmPreviewPage /> : <IndividualPreview />;
}
