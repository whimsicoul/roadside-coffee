'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-coffee-roman">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
