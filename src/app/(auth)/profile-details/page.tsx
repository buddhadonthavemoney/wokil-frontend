'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, Save, Monitor } from 'lucide-react';

import { useProfileForm } from '@/hooks/useProfileForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BasicInfoStep } from '@/components/form/steps/BasicInfoStep';
import { PracticeDetailsStep } from '@/components/form/steps/PracticeDetailsStep';
import { ContactInfoStep } from '@/components/form/steps/ContactInfoStep';
import { ProfessionalProfileStep } from '@/components/form/steps/ProfessionalProfileStep';
import { TimelineStep } from '@/components/form/steps/TimelineStep';
import { OnlinePresenceStep } from '@/components/form/steps/OnlinePresenceStep';
import { SubdomainSelectionStep } from '@/components/form/steps/SubdomainSelectionStep';
import { SiteContentStep } from '@/components/form/steps/SiteContentStep';

/**
 * Everything the step-by-step builder collects, on one page. Same state hook and
 * the same section components — this is the "edit one field without walking
 * seven steps" view, not a second source of truth.
 */
export default function ProfileDetails() {
  const { profile, updateNestedProfile, setProfile, saveProfileData, loading } = useProfileForm();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfileData();
      toast({ title: 'Saved', description: 'Your profile has been updated.' });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    <BasicInfoStep key="basic" profile={profile} onUpdate={(f) => updateNestedProfile('basicInformation', f)} />,
    <PracticeDetailsStep key="practice" profile={profile} onUpdate={(f) => updateNestedProfile('practiceDetails', f)} />,
    <ContactInfoStep key="contact" profile={profile} onUpdate={(f) => updateNestedProfile('contactInformation', f)} />,
    <ProfessionalProfileStep key="professional" profile={profile} onUpdate={(f) => updateNestedProfile('professionalProfile', f)} />,
    <TimelineStep key="timeline" profile={profile} onUpdate={(f) => updateNestedProfile('timeline', f)} />,
    <OnlinePresenceStep key="online" profile={profile} onUpdate={(f) => updateNestedProfile('onlinePresence', f)} />,
    <SiteContentStep
      key="content"
      profile={profile}
      onUpdate={(fields) => setProfile((p) => ({ ...p, siteContent: { ...p.siteContent, ...fields } }))}
    />,
    <SubdomainSelectionStep key="subdomain" profile={profile} onUpdate={(f) => updateNestedProfile('subdomainSelection', f)} />,
  ];

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-32">
      <main className="container mx-auto px-6 py-6 max-w-4xl">
        <PageHeader
          icon={<ClipboardList />}
          title="Profile Details"
          description="Every field in one place. Edit what you need and save."
          actions={
            <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push('/preview')}>
              <Monitor className="w-4 h-4" />
              Preview
            </Button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.key} className="bg-white border-none rounded-3xl p-6 md:p-8 shadow-premium">
                {section}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Save bar — the page is long, so keep saving reachable from anywhere in it. */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card/95 backdrop-blur border-t border-border">
        <div className="container mx-auto px-6 py-4 max-w-4xl flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Changes are saved to your profile and appear on your site after the next publish.
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
