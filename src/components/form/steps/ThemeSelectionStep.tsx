import { Label } from '@/components/ui/label';
import { LawyerProfile } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ThemeSelectionStepProps {
  profile: LawyerProfile;
  onUpdate: (fields: Partial<LawyerProfile['themeSelection']>) => void;
}

const themes = [
  {
    id: 'classic',
    name: 'The Classic',
    description: 'A timeless, authoritative design for traditional practices.',
    preview: { bg: 'bg-[#1B2B44]', accent: 'bg-[#C5A059]' }
  },
  {
    id: 'executive',
    name: 'Executive Suite',
    description: 'Institutional excellence for corporate and prestige law.',
    preview: { bg: 'bg-slate-50', accent: 'bg-blue-700' }
  },
  {
    id: 'legal-craft',
    name: 'Legal Craft',
    description: 'Artisan heritage with a focus on trust and detail.',
    preview: { bg: 'bg-[#FDFBF7]', accent: 'bg-[#D4A373]' }
  },
  {
    id: 'corporate-elite',
    name: 'Corporate Elite',
    description: 'Institutional navy with one unified career-and-education timeline.',
    preview: { bg: 'bg-[#faf9f8]', accent: 'bg-[#05162E]' }
  }
];

export function ThemeSelectionStep({ profile, onUpdate }: ThemeSelectionStepProps) {
  const { themeSelection } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Choose Your Theme</h2>
        <p className="text-muted-foreground">Select a design that represents your professional brand.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const isSelected = themeSelection.theme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onUpdate({ theme: theme.id as LawyerProfile['themeSelection']['theme'] })}
              // ... rest of button content
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
