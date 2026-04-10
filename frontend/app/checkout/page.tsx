'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { useCreateGuestOrder, useClaimGuestOrder } from '@/lib/hooks/useOrders';
import { useCreatePaymentIntent } from '@/lib/hooks/usePayments';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { OrderSummary } from '@/components/OrderSummary';
import { SubscriptionTierCards } from '@/components/SubscriptionTierCards';
import { SubscriptionSignupForm } from '@/components/SubscriptionSignupForm';
import { authStorage } from '@/lib/auth';
import { getAvailablePickupSlots } from '@/lib/pickupTimes';
import type { CartItem, GuestInfo } from '@/types';

// Stripe instance — must be module-level to avoid re-instantiation
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ─── Guest info form schema ───────────────────────────────────────────────────
const guestSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  license_plate: z.string().min(2, 'Required'),
});
type GuestFormData = z.infer<typeof guestSchema>;

// ─── Stripe inner payment form ────────────────────────────────────────────────
interface PaymentFormProps {
  guestInfo: GuestInfo;
  cart: CartItem[];
  total: number;
  pickupSlot: string;
  isLoggedIn: boolean;
  onBack: () => void;
}

function PaymentForm({ guestInfo, cart, total, pickupSlot, isLoggedIn, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const createGuestOrder = useCreateGuestOrder();
  const claimGuestOrder = useClaimGuestOrder();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    // Step 1: Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      setPaymentError('Payment was not completed. Please try again.');
      setIsProcessing(false);
      return;
    }

    // Step 2: Create the order on the backend
    try {
      const result = await createGuestOrder.mutateAsync({
        ...guestInfo,
        items: cart.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
        })),
        total_amount: total,
        ready_time: pickupSlot || undefined,
        stripe_payment_intent_id: paymentIntent.id,
      });

      // Step 3: If logged in, link the order to the user's account
      if (isLoggedIn) {
        await claimGuestOrder.mutateAsync(result.order.id);
      } else {
        sessionStorage.setItem('rc_guest_token', result.guestToken);
        sessionStorage.setItem('rc_guest_checkout', JSON.stringify(guestInfo));
      }

      sessionStorage.removeItem('cart');
      sessionStorage.removeItem('total');

      router.push(`/checkout/success?orderId=${result.order.id}`);
    } catch (err: any) {
      setPaymentError(
        err.response?.data?.error ||
          'Order creation failed after payment. Please contact support.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Stripe Payment Element */}
      <div className="card-elevated rounded-lg border border-coffee-oyster p-8">
        <h3 className="text-2xl text-coffee-oil font-semibold mb-6">Payment</h3>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-xl">{paymentError}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 bg-transparent border border-coffee-oyster text-coffee-judge hover:border-coffee-judge font-semibold py-4 rounded-lg transition-colors text-2xl"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-[2] bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-2xl"
          aria-busy={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Processing...
            </span>
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main checkout content ────────────────────────────────────────────────────
function CheckoutContent() {
  const router = useRouter();
  const { data: user } = useUser();
  const isLoggedIn = !!authStorage.getToken();
  const createPaymentIntent = useCreatePaymentIntent();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pickupSlot, setPickupSlot] = useState('');
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentIntentError, setPaymentIntentError] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('rc_sub_banner_dismissed') === '1';
  });
  const [signupTier, setSignupTier] = useState<'drink' | 'combo' | null>(null);

  // Only fetch subscription for logged-in users; guests skip the request
  const { data: subscription } = useSubscription({ enabled: isLoggedIn });
  const hasActiveSubscription = !!subscription;

  const dismissBanner = () => {
    sessionStorage.setItem('rc_sub_banner_dismissed', '1');
    setBannerDismissed(true);
  };

  const pickupSlots = getAvailablePickupSlots();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  });

  // Load cart from sessionStorage
  useEffect(() => {
    const cartData = sessionStorage.getItem('cart');
    const totalData = sessionStorage.getItem('total');
    if (cartData && totalData) {
      setCart(JSON.parse(cartData));
      setTotal(parseFloat(totalData));
    } else {
      router.push('/menu');
    }
  }, [router]);

  // Derive guest info from logged-in user if authenticated
  const resolvedGuestInfo: GuestInfo | null = isLoggedIn && user
    ? {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone ?? '',
        license_plate: user.license_plate ?? '',
      }
    : guestInfo;

  const proceedToPayment = async (info: GuestInfo) => {
    setIsLoadingPayment(true);
    setPaymentIntentError(null);
    try {
      const result = await createPaymentIntent.mutateAsync(
        Math.round(total * 100)
      );
      setClientSecret(result.clientSecret);
      setGuestInfo(info);
      setStep('payment');
    } catch (err: any) {
      setPaymentIntentError(
        err.response?.data?.error || 'Could not initialize payment. Please try again.'
      );
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const onGuestSubmit = (data: GuestFormData) => {
    proceedToPayment(data);
  };

  const onLoggedInSubmit = () => {
    if (!resolvedGuestInfo) return;
    proceedToPayment(resolvedGuestInfo);
  };

  // ── Form step ───────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="min-h-screen section-paper-bg">
        <div className="max-w-5xl mx-auto px-8 py-16">
          <div className="mb-12">
            <h1 className="text-6xl text-coffee-oil mb-4 font-semibold">Checkout</h1>
            <p className="text-3xl text-coffee-judge">Review your order and enter your details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {/* Returning customer banner — guests only */}
              {!isLoggedIn && (
                <div className="card-elevated rounded-lg border border-coffee-oyster p-6 flex items-center justify-between gap-4">
                  <p className="text-coffee-judge text-xl">Returning customer?</p>
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-coffee-oil font-semibold text-xl hover:underline whitespace-nowrap"
                  >
                    Log in to pre-fill your info →
                  </Link>
                </div>
              )}

              {/* Subscription upsell banner */}
              {!bannerDismissed && !hasActiveSubscription && (
                <div
                  className="card-elevated rounded-lg border border-coffee-oyster p-6 relative"
                  style={{ background: 'linear-gradient(135deg, #FEFDFB 0%, #F5F0E8 100%)' }}
                >
                  <button
                    type="button"
                    onClick={dismissBanner}
                    className="absolute top-3 right-4 text-coffee-roman hover:text-coffee-oil text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-coffee-oyster/30"
                    style={{ transition: 'color 150ms ease, background-color 150ms ease' }}
                    aria-label="Dismiss subscription offer"
                  >
                    ×
                  </button>
                  <p className="text-coffee-oil font-semibold text-lg mb-1 pr-8">
                    Skip the line every day
                  </p>
                  <p className="text-coffee-roman text-sm mb-4">
                    Subscribe and we'll have your order ready at the same time, every morning.
                  </p>
                  <SubscriptionTierCards
                    isLoggedIn={isLoggedIn}
                    hasActiveSubscription={false}
                    onSelectTier={setSignupTier}
                    layout="compact"
                  />
                </div>
              )}

              {/* Subscription signup modal */}
              {signupTier && (
                <SubscriptionSignupForm
                  initialTier={signupTier}
                  onSuccess={() => setSignupTier(null)}
                  onClose={() => setSignupTier(null)}
                />
              )}

              {/* Delivery details */}
              <div className="card-elevated rounded-lg border border-coffee-oyster p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl text-coffee-oil font-semibold">Your Details</h2>
                  {isLoggedIn && (
                    <Link
                      href="/settings"
                      className="text-2xl text-coffee-judge hover:text-coffee-oil transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                </div>

                {isLoggedIn && user ? (
                  // Pre-filled for logged-in users
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="border-l-2 border-coffee-oyster pl-5">
                        <p className="text-lg text-coffee-roman mb-1 font-semibold uppercase tracking-wide">First Name</p>
                        <p className="font-semibold text-coffee-oil text-2xl">{user.first_name}</p>
                      </div>
                      <div className="border-l-2 border-coffee-oyster pl-5">
                        <p className="text-lg text-coffee-roman mb-1 font-semibold uppercase tracking-wide">Last Name</p>
                        <p className="font-semibold text-coffee-oil text-2xl">{user.last_name}</p>
                      </div>
                    </div>
                    <div className="border-l-2 border-coffee-oyster pl-5">
                      <p className="text-lg text-coffee-roman mb-1 font-semibold uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-coffee-oil text-2xl">{user.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="border-l-2 border-coffee-oyster pl-5">
                        <p className="text-lg text-coffee-roman mb-1 font-semibold uppercase tracking-wide">Phone</p>
                        {user.phone ? (
                          <p className="font-semibold text-coffee-oil text-2xl">{user.phone}</p>
                        ) : (
                          <p className="text-coffee-judge text-xl">
                            Not set —{' '}
                            <Link href="/settings" className="underline">add in Settings</Link>
                          </p>
                        )}
                      </div>
                      <div className="border-l-2 border-coffee-oyster pl-5">
                        <p className="text-lg text-coffee-roman mb-1 font-semibold uppercase tracking-wide">License Plate</p>
                        {user.license_plate ? (
                          <p className="font-semibold text-coffee-oil text-2xl">{user.license_plate}</p>
                        ) : (
                          <p className="text-coffee-judge text-xl">
                            Not set —{' '}
                            <Link href="/settings" className="underline">add in Settings</Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Guest info form
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xl font-semibold text-coffee-oil mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('first_name')}
                          type="text"
                          autoComplete="given-name"
                          placeholder="Jane"
                          className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white"
                        />
                        {errors.first_name && (
                          <p className="text-red-600 text-lg mt-1">{errors.first_name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xl font-semibold text-coffee-oil mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('last_name')}
                          type="text"
                          autoComplete="family-name"
                          placeholder="Smith"
                          className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white"
                        />
                        {errors.last_name && (
                          <p className="text-red-600 text-lg mt-1">{errors.last_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xl font-semibold text-coffee-oil mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        autoComplete="email"
                        placeholder="jane@example.com"
                        className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-lg mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xl font-semibold text-coffee-oil mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          autoComplete="tel"
                          placeholder="(555) 000-0000"
                          className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-lg mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xl font-semibold text-coffee-oil mb-2">
                          License Plate <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('license_plate')}
                          type="text"
                          autoComplete="off"
                          placeholder="ABC-1234"
                          className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white uppercase"
                          style={{ textTransform: 'uppercase' }}
                        />
                        {errors.license_plate && (
                          <p className="text-red-600 text-lg mt-1">{errors.license_plate.message}</p>
                        )}
                        <p className="text-coffee-roman text-lg mt-1">
                          We use this to identify your vehicle at pickup
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup time */}
              <div className="card-elevated rounded-lg border border-coffee-oyster p-10">
                <h2 className="text-3xl text-coffee-oil font-semibold mb-6">Pickup Time</h2>
                {pickupSlots.length > 0 ? (
                  <div>
                    <label className="block text-xl font-semibold text-coffee-oil mb-3">
                      When are you arriving?
                    </label>
                    <select
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
                      className="w-full px-4 py-3 border border-coffee-roman rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white text-coffee-oil"
                    >
                      <option value="">Select a time slot</option>
                      {pickupSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-coffee-roman text-lg mt-2">
                      Optional — helps us time your order perfectly
                    </p>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-900 text-xl">
                      No pickup slots available today. We are open 6 AM – 3 PM.
                    </p>
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className="card-elevated rounded-lg border border-coffee-oyster p-10">
                <h3 className="text-3xl text-coffee-oil mb-8 font-semibold">Order Items</h3>
                <OrderSummary items={cart} total={total} />
              </div>
            </div>

            {/* Sticky sidebar */}
            <div className="lg:col-span-1">
              <div className="card-elevated rounded-lg shadow-refined-lg border border-coffee-oyster p-10 sticky top-4">
                <h3 className="text-3xl text-coffee-oil mb-10 font-semibold">Order Summary</h3>

                <div className="space-y-4 mb-10 pb-10 border-b border-coffee-oyster">
                  <div className="flex justify-between text-2xl text-coffee-judge">
                    <span>Items</span>
                    <span className="font-semibold">{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-4xl text-coffee-oil">
                    <span>Total</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>

                {paymentIntentError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-lg">{paymentIntentError}</p>
                  </div>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={onLoggedInSubmit}
                    disabled={isLoadingPayment || cart.length === 0}
                    className="w-full bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-2xl"
                    aria-busy={isLoadingPayment}
                  >
                    {isLoadingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Loading...
                      </span>
                    ) : (
                      'Continue to Payment'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit(onGuestSubmit)}
                    disabled={isLoadingPayment || cart.length === 0}
                    className="w-full bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-2xl"
                    aria-busy={isLoadingPayment}
                  >
                    {isLoadingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Loading...
                      </span>
                    ) : (
                      'Continue to Payment'
                    )}
                  </button>
                )}

                <Link
                  href="/menu"
                  className="block text-center mt-4 text-coffee-judge hover:underline text-2xl"
                >
                  ← Back to Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment step ────────────────────────────────────────────────────────────
  if (!clientSecret || !resolvedGuestInfo) return null;

  return (
    <div className="min-h-screen section-paper-bg">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-6xl text-coffee-oil mb-4 font-semibold">Payment</h1>
          <p className="text-3xl text-coffee-judge">
            Order for {resolvedGuestInfo.first_name} {resolvedGuestInfo.last_name}
          </p>
        </div>

        {/* Order total reminder */}
        <div className="card-elevated rounded-lg border border-coffee-oyster p-6 mb-8 flex items-center justify-between">
          <span className="text-2xl text-coffee-judge">Order Total</span>
          <span className="text-4xl text-coffee-oil font-semibold">${total.toFixed(2)}</span>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'flat',
              variables: {
                colorPrimary: '#3d2b1f',
                colorBackground: '#fefdfb',
                colorText: '#3d2b1f',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm
            guestInfo={resolvedGuestInfo}
            cart={cart}
            total={total}
            pickupSlot={pickupSlot}
            isLoggedIn={isLoggedIn}
            onBack={() => setStep('form')}
          />
        </Elements>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
