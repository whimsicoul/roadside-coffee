'use client';

import { Suspense } from 'react';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-coffee-roman">Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
