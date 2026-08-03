import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Theme } from "@/generated/wokil-api";

interface ThemeSelectorProps {
  themes: Theme[];
  currentTheme?: string;
  onThemeSelect: (theme: string) => void;
  isLoading?: boolean;
}

export function ThemeSelector({ themes, currentTheme, onThemeSelect, isLoading }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentThemeName = themes.find((t) => t.id === currentTheme)?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full px-4 border-border/50 bg-white hover:bg-white/80 shadow-sm gap-2 transition-all hover:scale-105 pr-3"
        >
          <Palette className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            {currentThemeName ?? "Select Theme"}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground/50 ml-0.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 rounded-2xl shadow-xl border-border/50" align="center">
        <div className="grid grid-cols-1 gap-1">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeSelect(theme.id);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-colors",
                currentTheme === theme.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              disabled={isLoading}
            >
              <span className="text-xs font-bold uppercase tracking-wide">
                {theme.name}
              </span>
              {currentTheme === theme.id && (
                <Check className="w-3.5 h-3.5" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
