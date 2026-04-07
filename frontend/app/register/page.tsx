'use client';

import { Suspense } from 'react';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-900 via-stone-800 to-amber-950">
      <Suspense fallback={<div className="text-amber-100">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
