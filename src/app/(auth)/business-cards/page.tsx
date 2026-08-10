'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/generated/wokil-api';
import { toLawyerProfile } from '@/lib/lawyer-profile-adapter';
import { useReactToPrint } from 'react-to-print';
import { BusinessCard, CardLayout, CardColor } from '@/components/BusinessCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Printer, IdCard, Loader2, AlertCircle, ArrowRight, Nfc } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BusinessCardPage() {
  const [cardLayout, setCardLayout] = useState<CardLayout>('classic');
  const [cardColor, setCardColor] = useState<CardColor>('slate');
  const componentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => toLawyerProfile((await getProfile({ throwOnError: true })).data),
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isProfileComplete = profile && 
    profile.basicInformation?.fullName && 
    profile.basicInformation?.professionalTitle && 
    profile.basicInformation?.yearsOfExperience !== undefined;

  if (!profile || !isProfileComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-xl shadow-premium p-10 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile Incomplete</h1>
            <p className="text-muted-foreground leading-relaxed">
              We need a bit more information before we can generate your professional business card.
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-left border border-border">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Required Fields</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-foreground/80">
                <div className={`w-1.5 h-1.5 rounded-full ${profile?.basicInformation?.fullName ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                Full Name
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/80">
                <div className={`w-1.5 h-1.5 rounded-full ${profile?.basicInformation?.professionalTitle ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                Professional Title
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/80">
                <div className={`w-1.5 h-1.5 rounded-full ${profile?.basicInformation?.yearsOfExperience !== undefined ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                Years of Experience
              </li>
            </ul>
          </div>

          <Button
            onClick={() => router.push('/profile-builder')}
            className="w-full h-12 rounded-xl text-md font-semibold gap-2 shadow-sm transition-all hover:scale-[1.02]"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getPublicUrl = () => {
    if (!profile.siteUrl) return '';
    const url = profile.siteUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-12">
          
        <PageHeader 
          icon={<IdCard />}
          title="Professional Business Card"
          description="Customize and print your physical business card."
          className="mb-12"
        />

          <div className="bg-card rounded-xl border-none shadow-premium p-8 md:p-10">
               <div className="flex flex-col gap-8">
                  <div className="flex justify-center">
                    <div className="inline-flex bg-muted/30 p-1 rounded-xl border border-border">
                      <div className="px-4 py-2 rounded-lg bg-card shadow-sm border border-border text-sm font-medium text-foreground text-center">
                        Standard Print
                      </div>
                      <div
                        title="Coming soon"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground/40 cursor-not-allowed select-none"
                      >
                        <Nfc className="w-4 h-4" />
                        NFC Digital Card
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 border border-border rounded px-1.5 py-0.5">
                          Soon
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center border-b border-border/50 pb-6">
                    {/* Layout Selector */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Layout Style</label>
                      <div className="flex items-center justify-center gap-2 bg-muted/30 p-1 rounded-xl">
                        {(['classic', 'minimal', 'modern'] as CardLayout[]).map((layout) => (
                          <button
                            key={layout}
                            onClick={() => setCardLayout(layout)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cardLayout === layout ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'}`}
                          >
                            {layout.charAt(0).toUpperCase() + layout.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selector */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Color Theme</label>
                      <div className="flex items-center justify-center gap-3">
                        {(['slate', 'blue', 'emerald', 'indigo', 'amber'] as CardColor[]).map((color) => (
                          <button
                            key={color}
                            onClick={() => setCardColor(color)}
                            className={`w-10 h-10 rounded-full border-4 transition-all ${cardColor === color ? 'border-primary/20 scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{
                              background: color === 'slate' ? '#0f172a' :
                                color === 'blue' ? '#2563eb' :
                                  color === 'amber' ? '#d97706' :
                                    color === 'emerald' ? '#059669' :
                                      '#4338ca'
                            }}
                            title={color.charAt(0).toUpperCase() + color.slice(1)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex justify-center bg-muted/30 rounded-xl border border-dashed border-border p-6">
                     <div className="w-full max-w-4xl">
                        <BusinessCard ref={componentRef} profile={profile} publicUrl={getPublicUrl()} layout={cardLayout} colorTheme={cardColor} />
                     </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="lg" onClick={() => handlePrint()} className="gap-2 px-8">
                      <Printer className="w-5 h-5" />
                      Print Business Card
                    </Button>
                  </div>
                </div>
          </div>
        </div>
      </main>
    </div>
  );
}
