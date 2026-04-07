'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-900 via-stone-800 to-amber-950">
      <Suspense fallback={<div className="text-amber-100">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
