'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import type { AuthResponse } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/menu';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (authStorage.getToken()) {
      router.push(redirectUrl);
    }
  }, [router, redirectUrl]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      const { token, user } = response.data;

      authStorage.setToken(token);
      authStorage.setUser(user);
      queryClient.clear();

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo + heading lockup */}
      <div className="flex flex-col items-center mb-5">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-judge rounded-full"
        >
          <Image
            src="/roadside-coffee-logo.png"
            alt="Roadside Coffee — go to home"
            width={64}
            height={64}
            className="rounded-full"
            style={{ mixBlendMode: 'multiply' }}
          />
        </Link>
        <h1 className="font-handwritten text-3xl text-coffee-oil mt-3 tracking-wide">Welcome Back</h1>
        <div
          style={{
            height: '2px',
            width: '80px',
            marginTop: '6px',
            background: 'linear-gradient(90deg, rgba(160,110,60,0.7) 0%, rgba(160,110,60,0.3) 50%, transparent 100%)',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Card */}
      <div className="card-paper-sheet rounded-xl shadow-refined-lg p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50/80 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600">⚠</span>
            <p className="text-red-800 text-sm leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-coffee-oil mb-1.5 uppercase tracking-widest">
              Email
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 text-sm border border-coffee-roman/70 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster"
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-coffee-oil mb-1.5 uppercase tracking-widest">
              Password
            </label>
            <input
              id="password"
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 text-sm border border-coffee-roman/70 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent placeholder:text-coffee-oyster"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-coffee-cream text-sm font-semibold py-2.5 rounded-lg transition-colors duration-200 tracking-wide"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block h-3.5 w-3.5 border-2 border-coffee-cream border-t-transparent rounded-full" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-coffee-oyster/50">
          <p className="text-center text-coffee-roman text-xs">
            Don't have an account?{' '}
            <Link href="/register" className="text-coffee-cappuccino font-semibold hover:text-coffee-judge transition-colors">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
