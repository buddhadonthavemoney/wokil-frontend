'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileForm } from '@/hooks/useProfileForm';
import { LawyerProfile } from '@/types/lawyer';
import { saveProfile } from '@/generated/wokil-api';
import { useQuery } from '@tanstack/react-query';
import { listThemesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { PreviewChrome } from '@/components/preview/PreviewChrome';
import { Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function IndividualPreview() {
  const { profile, publishProfile, setProfile, loading: hookLoading } = useProfileForm();

  const [isPublishing, setIsPublishing] = useState(false);
  const { data: themesData } = useQuery(listThemesOptions({ query: { category: 'individual' } }));
  const themes = themesData ?? [];
  const { toast } = useToast();
  const router = useRouter();

  // Switching themes is instant — it's just picking a different component to
  // render from local state, no server round trip needed for the preview
  // itself. Still persists to the backend so the choice survives a reload.
  const handleThemeChange = (newTheme: string) => {
    const updatedProfile: LawyerProfile = {
      ...profile,
      themeSelection: { theme: newTheme as LawyerProfile['themeSelection']['theme'] },
    };

    setProfile(updatedProfile);

    saveProfile({ body: updatedProfile, throwOnError: true }).catch((err) => {
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
      await publishProfile();
      router.push('/dashboard?deploying=true');
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

  if (hookLoading && !profile.basicInformation.fullName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Scale className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-xs label-caps text-muted-foreground animate-pulse">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <PreviewChrome
      editorHref="/profile-builder"
      onPublish={handlePublish}
      isPublishing={isPublishing}
      themes={themes}
      currentTheme={profile.themeSelection?.theme}
      onThemeChange={handleThemeChange}
    >
      <ProfilePreview profile={profile} />
    </PreviewChrome>
  );
}
