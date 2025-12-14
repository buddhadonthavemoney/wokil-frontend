import { Label } from '@/components/ui/label';
import { LawyerProfile } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ThemeSelectionStepProps {
  profile: LawyerProfile;
  onUpdate: <K extends keyof LawyerProfile>(field: K, value: LawyerProfile[K]) => void;
}

const themes = [
  {
    id: 'classic' as const,
    name: 'Classic',
    description: 'Traditional, authoritative design with serif typography',
    preview: {
      bg: 'bg-gradient-to-br from-[hsl(215,50%,23%)] to-[hsl(220,55%,18%)]',
      accent: 'bg-[hsl(45,70%,50%)]',
    },
  },
  {
    id: 'modern' as const,
    name: 'Modern',
    description: 'Clean, contemporary layout with bold accents',
    preview: {
      bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
      accent: 'bg-blue-500',
    },
  },
  {
    id: 'minimal' as const,
    name: 'Minimal',
    description: 'Elegant simplicity with focus on content',
    preview: {
      bg: 'bg-gradient-to-br from-stone-100 to-stone-50',
      accent: 'bg-stone-800',
    },
  },
];

export function ThemeSelectionStep({ profile, onUpdate }: ThemeSelectionStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Choose Your Theme</h2>
        <p className="text-muted-foreground">Select a design that represents your professional brand.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {themes.map((theme) => {
          const isSelected = profile.theme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onUpdate('theme', theme.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              {/* Theme Preview */}
              <div className={cn(
                "h-32 rounded-lg mb-4 relative overflow-hidden",
                theme.preview.bg
              )}>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className={cn("h-2 w-16 rounded mb-2", theme.preview.accent)} />
                  <div className="h-1.5 w-24 rounded bg-white/30" />
                  <div className="h-1.5 w-20 rounded bg-white/20 mt-1" />
                </div>
              </div>
              
              <h3 className="font-heading font-semibold text-foreground">{theme.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
