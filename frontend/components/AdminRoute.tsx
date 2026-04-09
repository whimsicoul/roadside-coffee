'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { useUser } from '@/lib/hooks/useUser';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasToken = !!authStorage.getToken();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (!hasToken) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (!isLoading && user && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [hasToken, isLoading, user, router]);

  if (!hasToken || isLoading) {
    return (
      <div className="min-h-screen bg-coffee-cream flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
