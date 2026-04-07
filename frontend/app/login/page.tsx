'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <Suspense fallback={<div className="text-stone-600">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
