'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { googleCallback } from '@/generated/wokil-api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const handledRef = useRef(false);

  useEffect(() => {
    const code = searchParams?.get('code');
    if (code && !handledRef.current) {
      handledRef.current = true;
      googleCallback({ query: { code }, throwOnError: true })
        .then(({ data }) => {
          localStorage.setItem('token', data.token);
          toast({
            title: "Success",
            description: "Successfully logged in with Google.",
          });
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Auth error:', error);
          toast({
            title: "Authentication Failed",
            description: "Could not complete Google login.",
            variant: "destructive",
          });
          router.push('/login');
        });
    } else if (!code) {
      router.push('/login');
    }
  }, [searchParams, router, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium animate-pulse">
        Completing authentication...
      </p>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Loading...
        </p>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
