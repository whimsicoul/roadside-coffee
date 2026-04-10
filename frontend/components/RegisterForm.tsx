'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import type { AuthResponse } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (authStorage.getToken()) {
      router.push('/menu');
    }
  }, [router]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { token, user } = response.data;

      authStorage.setToken(token);
      authStorage.setUser(user);
      queryClient.clear();

      router.push('/menu');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-1" style={{ minHeight: 'calc(100vh - 68px)' }}>
      {/* Left panel — atmospheric brand side */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #2D1E17 0%, #3B2614 40%, #523F31 100%)',
        }}
      >
        {/* Grain texture overlay */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-register">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-register)" />
        </svg>

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 70% 30%, rgba(200,150,62,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(121,98,84,0.2) 0%, transparent 60%)',
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-latte rounded-lg w-fit"
        >
          <Image
            src="/roadside-coffee-logo.png"
            alt="Roadside Coffee"
            width={44}
            height={44}
            className="rounded-full opacity-90 group-hover:opacity-100 transition-opacity duration-200"
          />
          <span className="font-display text-coffee-latte text-2xl tracking-wide opacity-90 group-hover:opacity-100 transition-opacity duration-200">
            Roadside Coffee
          </span>
        </Link>

        {/* Main copy */}
        <div className="relative z-10">
          <p className="text-coffee-oyster text-xs font-semibold uppercase tracking-[0.2em] mb-4">Join the regulars</p>
          <h2
            className="font-display text-coffee-cream leading-tight mb-6"
            style={{ fontSize: '3.5rem', letterSpacing: '-0.01em' }}
          >
            Start your<br />coffee story.
          </h2>
          <p className="text-coffee-roman text-sm leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}>
            Set up your account once. Your order, your pickup time, your license plate — remembered every time.
          </p>
        </div>

        {/* Bottom tag */}
        <div className="relative z-10">
          <div className="w-10 h-px bg-coffee-oyster/50 mb-4" />
          <p className="text-coffee-oyster/70 text-xs" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.85rem' }}>
            Freshly roasted. Roadside ready.
          </p>
        </div>
      </div>

      {/* Right panel — form side */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 bg-coffee-cream/40">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-judge rounded-full">
              <Image src="/roadside-coffee-logo.png" alt="Roadside Coffee" width={52} height={52} className="rounded-full" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-handwritten text-coffee-oil mb-1" style={{ fontSize: '2.25rem' }}>Create your account</h1>
            <p className="text-coffee-roman text-sm" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.95rem' }}>
              Join thousands of regulars who order ahead
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2.5">
              <span className="text-red-600 mt-0.5">⚠</span>
              <p className="text-red-800 text-sm leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs font-semibold text-coffee-oil mb-2 uppercase tracking-[0.14em]">
                  First Name
                </label>
                <input
                  id="first_name"
                  {...register('first_name')}
                  type="text"
                  className="w-full px-4 py-3 text-sm border border-coffee-roman/60 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster transition-shadow duration-200"
                  style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}
                  placeholder="John"
                  autoComplete="given-name"
                />
                {errors.first_name && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-xs font-semibold text-coffee-oil mb-2 uppercase tracking-[0.14em]">
                  Last Name
                </label>
                <input
                  id="last_name"
                  {...register('last_name')}
                  type="text"
                  className="w-full px-4 py-3 text-sm border border-coffee-roman/60 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster transition-shadow duration-200"
                  style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
                {errors.last_name && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-coffee-oil mb-2 uppercase tracking-[0.14em]">
                Email
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 text-sm border border-coffee-roman/60 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster transition-shadow duration-200"
                style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem' }}
                placeholder="your@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-coffee-oil mb-2 uppercase tracking-[0.14em]">
                Password{' '}
                <span className="font-normal text-coffee-roman normal-case tracking-normal text-xs">(min. 8 chars)</span>
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
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-coffee-oyster/40">
            <p className="text-center text-coffee-roman text-sm" style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link href="/login" className="text-coffee-cappuccino font-semibold hover:text-coffee-judge" style={{ transition: 'color 0.15s ease' }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
