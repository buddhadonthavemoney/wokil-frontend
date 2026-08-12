'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2, Save, User } from 'lucide-react';

import { useFirmForm } from '@/hooks/useFirmForm';
import { useRequireAccountType } from '@/hooks/useAccountType';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { RosterMemberFields } from '@/components/form/RosterMemberFields';
import { memberHref } from '@/lib/firm-roster';
import { RosterMember } from '@/types/firm';

/**
 * One lawyer, in full — everything the wizard's Team step collects, with room
 * for the timelines that a stacked card has to keep collapsed.
 *
 * Addressed by index rather than an id because that is what a roster member
 * has; the list is the only place that adds or removes, so an index stays put
 * for as long as this page is open.
 */
export default function RosterMemberPage() {
  const params = useParams<{ index: string }>();
  const index = Number(params?.index);
  const { firm, updateNestedFirm, saveFirmData, loaded } = useFirmForm();
  const { redirecting } = useRequireAccountType('firm', '/profile-details');
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const roster = firm.roster ?? [];
  const member: RosterMember | undefined = Number.isInteger(index) ? roster[index] : undefined;
  // The firm arrives async, so "no such lawyer" can only be judged once it has
  // — `loaded`, not `loading`, which is also false before the fetch starts.
  const missing = loaded && !redirecting && !member;

  useEffect(() => {
    if (missing) router.replace('/firm-roster');
  }, [missing, router]);

  const handleChange = (fields: Partial<RosterMember>) => {
    // The whole array, matching how RosterStep reports changes: updateNestedFirm
    // replaces a list outright rather than merging index-by-index.
    updateNestedFirm(
      'roster',
      roster.map((m, i) => (i === index ? { ...m, ...fields } : m))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFirmData();
      toast({ title: 'Saved', description: 'This lawyer’s details have been updated.' });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded || redirecting || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-32">
      <main className="container mx-auto px-6 py-6 max-w-4xl">
        <Link
          href="/firm-roster"
          className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Roster
        </Link>

        <PageHeader
          icon={<User />}
          title={member.fullName || 'New lawyer'}
          description={member.professionalTitle || "This lawyer's entry on your firm's People page."}
          actions={
            firm.siteUrl ? (
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a
                  href={`https://${firm.siteUrl}${memberHref(member, index)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on site
                </a>
              </Button>
            ) : undefined
          }
        />

        <section className="bg-white border-none rounded-3xl p-6 md:p-8 shadow-premium">
          <RosterMemberFields
            member={member}
            idPrefix={String(index)}
            onChange={handleChange}
            defaultTimelineOpen
          />
        </section>
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
