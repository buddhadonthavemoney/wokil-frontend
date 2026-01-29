import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profile as profileApi } from '@/lib/api';
import { useReactToPrint } from 'react-to-print';
import { BusinessCard, CardLayout, CardColor } from '@/components/BusinessCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Printer, IdCard, Loader2 } from 'lucide-react';

export default function BusinessCardPage() {
  const [cardLayout, setCardLayout] = useState<CardLayout>('classic');
  const [cardColor, setCardColor] = useState<CardColor>('slate');
  const componentRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const getPublicUrl = () => {
    if (!profile.siteUrl) return '';
    const url = profile.siteUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-12">
          
        <PageHeader 
          icon={<IdCard />}
          title="Professional Business Card"
          description="Customize and print your physical business card."
          className="mb-12"
        />

          <div className="bg-white rounded-3xl border-none shadow-premium p-8 md:p-10">
               <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center border-b border-border/50 pb-6">
                    {/* Layout Selector */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Layout Style</label>
                      <div className="flex items-center justify-center gap-2 bg-muted/30 p-1 rounded-xl">
                        {(['classic', 'minimal', 'modern'] as CardLayout[]).map((layout) => (
                          <button
                            key={layout}
                            onClick={() => setCardLayout(layout)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cardLayout === layout ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'}`}
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

                  <div className="w-full flex justify-center bg-slate-50/50 rounded-xl border border-dashed border-border p-6">
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
