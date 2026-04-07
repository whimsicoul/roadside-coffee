'use client';

import { Suspense } from 'react';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <Suspense fallback={<div className="text-stone-600">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
