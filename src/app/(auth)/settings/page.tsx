'use client';

import { Settings as SettingsIcon, ArrowLeft, TrendingUp, CheckCircle2, Loader2, Eye, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, createGaProperty, updateProfileVisibility } from '@/generated/wokil-api';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Profile to check for Google Analytics ID
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await getProfile({ throwOnError: true })).data,
  });

  // Enable Analytics Mutation
  const enableAnalyticsMutation = useMutation({
    mutationFn: async () => (await createGaProperty({ throwOnError: true })).data,
    onSuccess: () => {
      toast({
        title: "Analytics Enabled",
        description: "Google Analytics has been successfully enabled for your site.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enable analytics.",
        variant: "destructive",
      });
    },
  });

  // Visibility Mutation
  const updateVisibilityMutation = useMutation({
    mutationFn: (data: { isPublic: boolean; showPicture: boolean }) => updateProfileVisibility({ body: data, throwOnError: true }),
    onSuccess: () => {
      toast({
        title: "Visibility Updated",
        description: "Your profile visibility settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update visibility.",
        variant: "destructive",
      });
    },
  });

  const handleToggleVisibility = (key: string, value: boolean) => {
    const isPublic = key === 'isPublic' ? value : (profile?.isPublic ?? false);
    let showPicture = key === 'showPicture' ? value : (profile?.showPicture ?? true);

    // Ensure if public is disabled, showPicture is also treated as disabled/false
    if (!isPublic) {
        showPicture = false;
    }

    updateVisibilityMutation.mutate({ 
        isPublic, 
        showPicture 
    });
  };

  const handleEnableAnalytics = () => {
    enableAnalyticsMutation.mutate();
  };

  if (isProfileLoading) {
     return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <PageHeader 
          icon={<SettingsIcon />}
          title="Settings"
          description="Manage your account preferences and site configuration."
          className="mb-12"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          }
        />
        
        {/* Analytics Section */}
        <section className="space-y-8 pt-4">
            <div className="grid gap-8">
                {/* Visibility Settings */}
                <div className="bg-card border-none rounded-xl p-8 shadow-premium space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="p-2 bg-primary/5 rounded-lg">
                            <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Profile Visibility</h3>
                            <p className="text-xs text-muted-foreground font-medium">Control how your profile appears to the public.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Public Profile</Label>
                                <p className="text-xs text-muted-foreground">Allow your profile to be indexed and shown in our directories.</p>
                            </div>
                            <Switch 
                                disabled={updateVisibilityMutation.isPending}
                                checked={profile?.isPublic ?? false}
                                onCheckedChange={(val) => handleToggleVisibility('isPublic', val)}
                            />
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-6">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-bold">Show Profile Picture</Label>
                                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Display your profile photo on your public website and cards.</p>
                            </div>
                            <Switch 
                                checked={profile?.showPicture ?? true}
                                disabled={updateVisibilityMutation.isPending || !(profile?.isPublic)}
                                onCheckedChange={(val) => handleToggleVisibility('showPicture', val)}
                            />
                        </div>
                    </div>
                </div>

                {!profile?.googleAnalyticsId ? (
                <div className="bg-card border-none rounded-xl p-10 md:p-14 text-center shadow-premium">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Enable Site Analytics</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Get detailed insights about your visitors, page views, and traffic sources by enabling Google Analytics integration.
                    </p>
                    <Button 
                        size="lg" 
                        onClick={handleEnableAnalytics} 
                        disabled={enableAnalyticsMutation.isPending}
                        className="px-8"
                    >
                        {enableAnalyticsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Enable Analytics
                    </Button>
                </div>
            ) : (
                <div className="bg-card border-none rounded-xl p-10 md:p-14 text-center shadow-premium">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Analytics Active</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Google Analytics is actively tracking your site traffic. You can view detailed insights on your Dashboard.
                    </p>
                    <Button 
                        variant="outline"
                        onClick={() => router.push('/dashboard')} 
                    >
                        Go to Dashboard
                    </Button>
                </div>
            )}
            </div>
        </section>

      </main>
    </div>
  );
}
