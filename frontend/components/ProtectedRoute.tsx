'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!authStorage.getToken()
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + window.location.pathname);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
