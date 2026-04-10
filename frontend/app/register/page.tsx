'use client';

import { Suspense } from 'react';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-coffee-roman">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
