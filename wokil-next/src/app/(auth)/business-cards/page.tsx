'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { QrCode } from 'lucide-react';

export default function BusinessCards() {
  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <PageHeader 
          icon={<QrCode />}
          title="Business Cards"
          description="Design and share your digital legal business cards."
          className="mb-12"
        />
        <div className="bg-white border-none rounded-3xl p-10 text-center shadow-premium">
            <h3 className="text-xl font-bold mb-3">Migration in Progress</h3>
            <p className="text-muted-foreground">The Business Cards interface is being migrated to Next.js.</p>
        </div>
      </main>
    </div>
  );
}
