'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { api } from '@/lib/api';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-1" style={{ minHeight: 'calc(100vh - 68px)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #2D1E17 0%, #3B2614 40%, #523F31 100%)' }}
      >
        <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-rp">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-rp)" />
        </svg>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 30% 70%, rgba(200,150,62,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(121,98,84,0.2) 0%, transparent 60%)',
          }}
        />
        <Link
          href="/"
          className="relative z-10 flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-latte rounded-lg w-fit"
        >
          <Image src="/roadside-coffee-logo.png" alt="Roadside Coffee" width={44} height={44} className="rounded-full opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
          <span className="font-display text-coffee-latte text-2xl tracking-wide opacity-90 group-hover:opacity-100 transition-opacity duration-200">
            Roadside Coffee
          </span>
        </Link>
        <div className="relative z-10">
          <p className="text-coffee-oyster text-xs font-semibold uppercase tracking-[0.2em] mb-4">Almost there</p>
          <h2 className="font-display text-coffee-cream leading-tight mb-6" style={{ fontSize: '3.5rem', letterSpacing: '-0.01em' }}>
            New password,<br />fresh start.
          </h2>
          <p className="text-coffee-roman text-sm leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}>
            Choose something memorable — your morning coffee is waiting on the other side.
          </p>
        </div>
        <div className="relative z-10">
          <div className="w-10 h-px bg-coffee-oyster/50 mb-4" />
          <p className="text-coffee-oyster/70 text-xs" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.85rem' }}>
            Freshly roasted. Roadside ready.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 bg-coffee-cream/40">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-judge rounded-full">
              <Image src="/roadside-coffee-logo.png" alt="Roadside Coffee" width={52} height={52} className="rounded-full" />
            </Link>
          </div>

          {!token ? (
            <div className="text-center">
              <p className="text-coffee-roman mb-6" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}>
                This reset link is invalid or has already been used.
              </p>
              <Link href="/forgot-password" className="text-coffee-cappuccino font-semibold hover:text-coffee-judge text-sm" style={{ transition: 'color 0.15s ease' }}>
                Request a new link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(107,92,82,0.12)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B5C52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="font-handwritten text-coffee-oil mb-3" style={{ fontSize: '2rem' }}>Password updated!</h1>
              <p className="text-coffee-roman text-sm leading-relaxed" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.95rem' }}>
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-handwritten text-coffee-oil mb-1" style={{ fontSize: '2.25rem' }}>Set new password</h1>
                <p className="text-coffee-roman text-sm" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.95rem' }}>
                  Must be at least 8 characters.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-red-600 mt-0.5">⚠</span>
                  <p className="text-red-800 text-sm leading-snug">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-coffee-oil mb-2 uppercase tracking-[0.14em]">
                    New Password
                  </label>
                  <input
                    id="password"
                    {...register('password')}
                    type="password"
                    className="w-full px-4 py-3 text-sm border border-coffee-roman/60 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster transition-shadow duration-200"
                    style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-xs font-semibold text-coffee-oil mb-2 uppercase tracking-[0.14em]">
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    {...register('confirm')}
                    type="password"
                    className="w-full px-4 py-3 text-sm border border-coffee-roman/60 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster transition-shadow duration-200"
                    style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {errors.confirm && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.confirm.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-1 bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-coffee-cream text-sm font-semibold py-3.5 rounded-xl tracking-wide"
                  style={{ transition: 'background-color 0.2s ease, transform 0.1s ease' }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.99)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block h-4 w-4 border-2 border-coffee-cream border-t-transparent rounded-full" />
                      Updating...
                    </span>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-coffee-oyster/40">
                <p className="text-center text-coffee-roman text-sm" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.9rem' }}>
                  <Link href="/login" className="text-coffee-cappuccino font-semibold hover:text-coffee-judge" style={{ transition: 'color 0.15s ease' }}>
                    ← Back to sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-coffee-roman">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
