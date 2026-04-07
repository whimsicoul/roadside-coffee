'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import type { AuthResponse } from '@/types';
import Link from 'next/link';

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
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">☕</div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
            Get Started
          </h1>
          <p className="text-stone-600">Create your coffee account in minutes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <span className="text-red-600 text-lg">⚠</span>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-stone-900 mb-2">
                First Name *
              </label>
              <input
                id="first_name"
                {...register('first_name')}
                type="text"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                placeholder="John"
                autoComplete="given-name"
              />
              {errors.first_name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-semibold text-stone-900 mb-2">
                Last Name *
              </label>
              <input
                id="last_name"
                {...register('last_name')}
                type="text"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                placeholder="Doe"
                autoComplete="family-name"
              />
              {errors.last_name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-stone-900 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-stone-900 mb-2">
              Password * <span className="font-normal text-stone-500">(min. 8 characters)</span>
            </label>
            <input
              id="password"
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-200">
          <p className="text-center text-stone-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-800 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
