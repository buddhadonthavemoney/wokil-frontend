import { Settings as SettingsIcon, ArrowLeft, BarChart3, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profile as profileApi, site as siteApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/PageHeader';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Profile to check for Google Analytics ID
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  // Enable Analytics Mutation
  const enableAnalyticsMutation = useMutation({
    mutationFn: siteApi.enableAnalytics,
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

  const handleEnableAnalytics = () => {
    enableAnalyticsMutation.mutate();
  };

  if (isProfileLoading) {
     return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <PageHeader 
          icon={<SettingsIcon />}
          title="Settings"
          description="Manage your account preferences and site configuration."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          }
        />
        
        {/* Analytics Section */}
        <section className="space-y-6 pt-4">
            {!profile?.googleAnalyticsId ? (
                <div className="bg-white border border-border rounded-xl p-8 md:p-12 text-center shadow-sm">
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
                <div className="bg-white border border-border rounded-xl p-8 md:p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Analytics Active</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Google Analytics is actively tracking your site traffic. You can view detailed insights on your Dashboard.
                    </p>
                    <Button 
                        variant="outline"
                        onClick={() => navigate('/dashboard')} 
                    >
                        Go to Dashboard
                    </Button>
                </div>
            )}
        </section>

      </main>
    </div>
  );
}
