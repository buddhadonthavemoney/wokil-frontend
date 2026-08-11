'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft, Check, Loader2 } from 'lucide-react';

interface PreviewChromeProps {
  /** Where "Back to Editor" goes — the wizard this preview belongs to. */
  editorHref: string;
  onPublish: () => void;
  isPublishing: boolean;
  themes: { id: string; name: string }[];
  currentTheme?: string;
  onThemeChange: (themeId: string) => void;
  /** The rendered site preview. */
  children: ReactNode;
}

/**
 * Full-screen preview frame: back/publish bar, theme switcher, and the site
 * itself. Shared by the individual and firm previews, which differ only in
 * which form hook they read, which themes they offer and what publishing
 * calls — not in any of this chrome.
 */
export function PreviewChrome({
  editorHref,
  onPublish,
  isPublishing,
  themes,
  currentTheme,
  onThemeChange,
  children,
}: PreviewChromeProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(editorHref)}
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
            onClick={onPublish}
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

      <div className="pt-[73px] h-full">{children}</div>

      {/* Theme switcher overlay. Hidden when there is only one theme to pick —
          a single-button switcher is chrome with nothing to switch. */}
      {themes.length > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[90%] sm:w-auto overflow-hidden">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-1.5 sm:p-2 flex items-center gap-1 shadow-primary/10 overflow-x-auto no-scrollbar scroll-smooth">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                disabled={isPublishing}
                className={cn(
                  'px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 capitalize',
                  isPublishing && 'opacity-50 cursor-not-allowed',
                  currentTheme === theme.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-black/5 hover:text-foreground'
                )}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
