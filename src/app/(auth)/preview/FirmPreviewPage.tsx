'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useFirmForm } from '@/hooks/useFirmForm';
import { updateFirm } from '@/generated/wokil-api';
import { listThemesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { FirmProfile } from '@/types/firm';
import { FirmPreview } from '@/components/preview/FirmPreview';
import { PreviewChrome } from '@/components/preview/PreviewChrome';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FirmPreviewPage() {
  const { firm, publishFirm, setFirm, loading: hookLoading } = useFirmForm();

  const [isPublishing, setIsPublishing] = useState(false);
  const { data: themesData } = useQuery(listThemesOptions({ query: { category: 'firm' } }));
  const themes = themesData ?? [];
  const { toast } = useToast();
  const router = useRouter();

  // Mirrors the individual preview: swap the component immediately, persist in
  // the background so the choice survives a reload. Posts the built object
  // rather than going through saveFirmData, which would read the pre-switch
  // theme from the closure it was created with.
  const handleThemeChange = (newTheme: string) => {
    const updated: FirmProfile = { ...firm, themeSelection: { theme: newTheme } };
    setFirm(updated);

    const payload = { ...updated };
    // Same subdomain lock saveFirmData guards against: once deployed, sending
    // the subdomain back turns an ordinary save into a 400.
    if (updated.firmProfile?.deploymentURL) {
      delete (payload as Partial<FirmProfile>).subdomainSelection;
    }

    updateFirm({ body: payload as FirmProfile, throwOnError: true }).catch((err) => {
      console.error('Theme switch failed to save:', err);
      toast({
        title: 'Update Failed',
        description: 'Could not save the theme change. Please try again.',
        variant: 'destructive',
      });
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishFirm();
      router.push('/firm-dashboard?deploying=true');
    } catch (err) {
      console.error('Publish failed:', err);
      toast({
        title: 'Publish Failed',
        description:
          err instanceof Error ? err.message : 'There was an error initiating publication.',
        variant: 'destructive',
      });
      setIsPublishing(false);
    }
  };

  if (hookLoading && !firm.firmDetails.name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Building2 className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-xs label-caps text-muted-foreground animate-pulse">
          Loading Firm...
        </p>
      </div>
    );
  }

  return (
    <PreviewChrome
      editorHref="/firm-builder"
      onPublish={handlePublish}
      isPublishing={isPublishing}
      themes={themes}
      currentTheme={firm.themeSelection?.theme}
      onThemeChange={handleThemeChange}
    >
      {/* Full-page preview, so there is room for the Home / Team switch. A
          firm's site is two pages and both are worth seeing before publish. */}
      <FirmPreview firm={firm} pageToggle />
    </PreviewChrome>
  );
}
