'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-coffee-roman">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
