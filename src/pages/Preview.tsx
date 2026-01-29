import { useState, useEffect } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';
import { LawyerProfile } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { profile as profileApi, site as siteApi } from '@/lib/api';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { Button } from '@/components/ui/button';
import { Scale, Eye, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Preview() {
  const {
    profile,
    publishProfile,
    fetchPreview,
    setProfile,
    loading: hookLoading,
  } = useProfileForm();

  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [themes, setThemes] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const data = await siteApi.getThemes();
        setThemes(data);
      } catch (err) {
        console.error("Failed to fetch themes", err);
      }
    };
    loadThemes();
  }, []);

  const loadPreviewData = async () => {
    setLoadingPreview(true);
    try {
      const html = await fetchPreview();
      setPreviewHtml(html);
    } catch (err) {
      console.error("Failed to load preview", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (!hookLoading) {
      loadPreviewData();
    }
  }, [hookLoading, fetchPreview]);

  const handleThemeChange = async (newTheme: string) => {
    const updatedProfile: LawyerProfile = {
      ...profile,
      themeSelection: { theme: newTheme as any }
    };

    setProfile(updatedProfile);
    setLoadingPreview(true);
    
    try {
      await profileApi.save(updatedProfile);
      await new Promise(resolve => setTimeout(resolve, 400));
      const html = await fetchPreview();
      setPreviewHtml(html);
    } catch (err) {
      console.error("Theme switch failed:", err);
      toast({
        title: "Update Failed",
        description: "Could not switch theme. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishProfile();
      navigate('/dashboard', {
        state: { deploying: true }
      });
    } catch (err: any) {
      console.error("Publish failed:", err);
      toast({
        title: "Publish Failed",
        description: err.message || "There was an error initiating publication.",
        variant: "destructive",
      });
      setIsPublishing(false);
    }
  };

  if (hookLoading && !profile.basicInformation.fullName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Scale className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile-builder')}
            className="gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Editor</span>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span>
          </div>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-6 shadow-lg shadow-primary/20"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Publishing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Publish Now</span>
                <span className="sm:hidden">Publish</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="pt-[73px] h-full">
        {loadingPreview ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Scale className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Generating Professional Site...</p>
          </div>
        ) : (
          <ProfilePreview profile={profile} html={previewHtml} />
        )}
      </div>

      {/* Theme Switcher Overlay */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[90%] sm:w-auto overflow-hidden">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-1.5 sm:p-2 flex items-center gap-1 shadow-primary/10 overflow-x-auto no-scrollbar scroll-smooth">
          {themes.map((themeId) => (
            <button
              key={themeId}
              onClick={() => handleThemeChange(themeId)}
              disabled={loadingPreview}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 capitalize",
                loadingPreview && "opacity-50 cursor-not-allowed",
                profile.themeSelection?.theme === themeId 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
              )}
            >
              {themeId.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
