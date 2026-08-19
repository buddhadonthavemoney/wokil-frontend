'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

// The token only changes on sign-in/out, both of which navigate away from any
// guarded page, so nothing has to subscribe.
const subscribe = () => () => {};
const readToken = () => localStorage.getItem('token');
// undefined, not null: on the server (and the hydrating render) the token has
// not been read yet, which must not be mistaken for "signed out" and bounce a
// signed-in visitor off their own page.
const unread = () => undefined;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, readToken, unread);
  const authorized = !!token;

  useEffect(() => {
    if (token === null) router.push('/');
  }, [token, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying access...</div>
      </div>
    );
  }

  return <>{children}</>;
}
