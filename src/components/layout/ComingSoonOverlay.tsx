'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ComingSoonOverlayProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Wraps a page preview with a blurred, non-interactive overlay so the
 * upcoming feature's real layout is visible (per the Stitch design) without
 * being usable yet.
 */
export function ComingSoonOverlay({ title, description, children }: ComingSoonOverlayProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none select-none blur-[1px]" aria-hidden="true">
        {children}
      </div>
      <div className="fixed inset-0 z-10 bg-primary/15 pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 z-20 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-card border border-border rounded-xl shadow-lg p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-secondary border border-accent flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Coming Soon</p>
            <h2 className="text-lg font-heading font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
