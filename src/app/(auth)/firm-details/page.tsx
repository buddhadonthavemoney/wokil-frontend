'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, Save, Monitor } from 'lucide-react';

import { useFirmForm } from '@/hooks/useFirmForm';
import { useRequireAccountType } from '@/hooks/useAccountType';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FIRM_STEPS } from '@/components/form/firmSteps';

/**
 * Everything the firm wizard collects, on one page — the sibling of
 * /profile-details, and the second half of the sidebar's Firm sub-menu.
 *
 * Same state hook and the same step components as the wizard, so this is the
 * "edit one field without walking seven steps" view, not a second source of
 * truth.
 *
 * The sections are driven off FIRM_STEPS rather than a hand-written list (which
 * is what /profile-details does, predating PROFILE_STEPS): a step added to the
 * wizard shows up here automatically instead of quietly going missing.
 */
export default function FirmDetails() {
  // No initialStep: that argument exists for the dashboard's roster deep link,
  // and passing one here would also suppress nothing, since this page has no
  // step to resume to.
  const { firm, updateNestedFirm, saveFirmData, loading } = useFirmForm();
  const { redirecting } = useRequireAccountType('firm', '/profile-details');
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFirmData();
      toast({ title: 'Saved', description: "Your firm's details have been updated." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-32">
      <main className="container mx-auto px-6 py-6 max-w-4xl">
        <PageHeader
          icon={<ClipboardList />}
          title="Firm Details"
          description="Every field in one place. Edit what you need and save."
          actions={
            <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push('/preview')}>
              <Monitor className="w-4 h-4" />
              Preview
            </Button>
          }
        />

        {loading || redirecting ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {FIRM_STEPS.map(({ key, Component }) => (
              <section key={key} className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <Component profile={firm} onUpdate={(fields: object) => updateNestedFirm(key, fields)} />
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Save bar — the page is long, so keep saving reachable from anywhere in it. */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card/95 backdrop-blur border-t border-border">
        <div className="container mx-auto px-6 py-4 max-w-4xl flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Changes are saved to your firm and appear on your site after the next publish.
          </p>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
