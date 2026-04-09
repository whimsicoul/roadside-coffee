'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useClaimGuestOrder } from '@/lib/hooks/useOrders';
import { queryClient } from '@/lib/queryClient';
import type { AuthResponse, GuestInfo } from '@/types';

// ─── Account creation schema (password only — info already known) ─────────────
const accountSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type AccountFormData = z.infer<typeof accountSchema>;

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const claimOrder = useClaimGuestOrder();

  const isLoggedIn = !!authStorage.getToken();

  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    if (!orderId) {
      router.push('/menu');
      return;
    }

    const raw = sessionStorage.getItem('rc_guest_checkout');
    if (raw) {
      setGuestInfo(JSON.parse(raw));
    }
  }, [orderId, router]);

  const onCreateAccount = async (data: AccountFormData) => {
    if (!guestInfo || !orderId) return;

    setIsSubmitting(true);
    setAccountError(null);

    try {
      // Register the account with guest info pre-filled
      const response = await api.post<AuthResponse>('/auth/register', {
        first_name: guestInfo.first_name,
        last_name: guestInfo.last_name,
        email: guestInfo.email,
        phone: guestInfo.phone,
        license_plate: guestInfo.license_plate,
        password: data.password,
      });

      const { token, user } = response.data;
      authStorage.setToken(token);
      authStorage.setUser(user);
      queryClient.clear();

      // Link the guest order to the new account
      await claimOrder.mutateAsync(parseInt(orderId));

      // Clean up guest data from sessionStorage
      sessionStorage.removeItem('rc_guest_checkout');
      sessionStorage.removeItem('rc_guest_token');

      setAccountCreated(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (err.response?.status === 409) {
        setAccountError(
          'An account with this email already exists. Log in to link your order.'
        );
      } else {
        setAccountError(msg || 'Account creation failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="min-h-screen section-paper-bg flex items-center justify-center px-8 py-16">
      <div className="w-full max-w-xl space-y-6">
        {/* ── Confirmation card ─────────────────────────────────────────────── */}
        <div className="card-elevated rounded-lg shadow-refined-lg border border-coffee-oyster p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coffee-gorzka mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-5xl text-coffee-oil mb-3 font-semibold">Order Placed!</h1>
            <p className="text-2xl text-coffee-judge">
              {guestInfo
                ? `Thanks, ${guestInfo.first_name}! We're on it.`
                : "We're on it!"}
            </p>
          </div>

          {/* Order ID */}
          <div className="bg-coffee-parchment rounded border border-coffee-oyster p-6 mb-8 text-center">
            <p className="text-xl text-coffee-roman mb-2 font-semibold uppercase tracking-wide">Order ID</p>
            <p className="text-4xl text-coffee-oil font-semibold">#{orderId}</p>
          </div>

          <p className="text-coffee-judge text-center mb-8 text-xl">
            Your order has been received. We'll have it ready at your pickup time.
          </p>

          {/* If guest, show their license plate as confirmation */}
          {guestInfo?.license_plate && (
            <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-coffee-parchment rounded border border-coffee-oyster">
              <svg className="w-5 h-5 text-coffee-roman flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
              </svg>
              <span className="text-coffee-oil font-semibold text-xl uppercase tracking-widest">
                {guestInfo.license_plate}
              </span>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/menu"
              className="block w-full bg-coffee-judge hover:bg-coffee-oil text-white font-semibold py-4 rounded-lg text-center transition-colors text-2xl"
            >
              Place Another Order
            </Link>
            {isLoggedIn && (
              <Link
                href="/orders"
                className="block w-full border border-coffee-oyster text-coffee-judge hover:border-coffee-judge font-semibold py-4 rounded-lg text-center transition-colors text-2xl"
              >
                View My Orders
              </Link>
            )}
          </div>
        </div>

        {/* ── Account upsell — shown only for guests who aren't logged in ───── */}
        {!isLoggedIn && guestInfo && !accountCreated && (
          <div className="card-elevated rounded-lg border border-coffee-oyster p-10">
            <div className="mb-8">
              <h2 className="text-3xl text-coffee-oil font-semibold mb-3">
                Save your details for next time
              </h2>
              <p className="text-xl text-coffee-judge">
                Create a free account and your name, email, phone, and license plate will be pre-filled at checkout — no more typing.
              </p>
            </div>

            {/* Pre-filled info preview */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-coffee-parchment rounded-lg border border-coffee-oyster">
              <div>
                <p className="text-lg text-coffee-roman font-semibold uppercase tracking-wide mb-1">Name</p>
                <p className="text-xl text-coffee-oil font-semibold">
                  {guestInfo.first_name} {guestInfo.last_name}
                </p>
              </div>
              <div>
                <p className="text-lg text-coffee-roman font-semibold uppercase tracking-wide mb-1">Email</p>
                <p className="text-xl text-coffee-oil font-semibold truncate">{guestInfo.email}</p>
              </div>
              <div>
                <p className="text-lg text-coffee-roman font-semibold uppercase tracking-wide mb-1">Phone</p>
                <p className="text-xl text-coffee-oil font-semibold">{guestInfo.phone}</p>
              </div>
              <div>
                <p className="text-lg text-coffee-roman font-semibold uppercase tracking-wide mb-1">Plate</p>
                <p className="text-xl text-coffee-oil font-semibold uppercase">{guestInfo.license_plate}</p>
              </div>
            </div>

            {/* Password-only form */}
            {accountError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-lg">{accountError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onCreateAccount)} className="space-y-5">
              <div>
                <label className="block text-xl font-semibold text-coffee-oil mb-2">
                  Choose a password <span className="font-normal text-coffee-roman">(min. 8 characters)</span>
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white"
                />
                {errors.password && (
                  <p className="text-red-600 text-lg mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-2xl"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-coffee-roman text-lg mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-coffee-judge font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        )}

        {/* ── Account created confirmation ──────────────────────────────────── */}
        {accountCreated && (
          <div className="card-elevated rounded-lg border border-coffee-oyster p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl text-coffee-oil font-semibold mb-2">Account Created!</h3>
            <p className="text-xl text-coffee-judge mb-6">
              Your order has been linked to your new account.
            </p>
            <Link
              href="/orders"
              className="inline-block bg-coffee-judge hover:bg-coffee-oil text-white font-semibold px-8 py-3 rounded-lg transition-colors text-2xl"
            >
              View My Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
