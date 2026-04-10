'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { useCreateSubscription } from '@/lib/hooks/useSubscription';
import { useMenu } from '@/lib/hooks/useMenu';

// ─── Schema (mirrors settings/page.tsx) ───────────────────────────────────────
const subscriptionFormSchema = z.object({
  tier: z.enum(['drink', 'combo'] as const),
  drink_item_id: z.coerce.number().int().positive('Please select a drink'),
  food_item_id: z.coerce.number().int().positive().optional(),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, 'Select a pickup time'),
  duration: z.enum(['1w', '1m', '3m'] as const),
}).refine((d) => d.tier !== 'combo' || (d.food_item_id !== undefined && d.food_item_id > 0), {
  message: 'Please select a food item for the Daily Combo',
  path: ['food_item_id'],
}) as any;

type SubscriptionFormData = {
  tier: 'drink' | 'combo';
  drink_item_id: number;
  food_item_id?: number;
  pickup_time: string;
  duration: '1w' | '1m' | '3m';
};

const DURATION_LABELS: Record<string, string> = {
  '1w': '1 Week',
  '1m': '1 Month',
  '3m': '3 Months',
};

function computeEndDate(duration: '1w' | '1m' | '3m'): Date {
  const d = new Date();
  if (duration === '1w') d.setDate(d.getDate() + 7);
  else if (duration === '1m') d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SubscriptionSignupFormProps {
  initialTier: 'drink' | 'combo';
  onSuccess: () => void;
  onClose: () => void;
}

export function SubscriptionSignupForm({
  initialTier,
  onSuccess,
  onClose,
}: SubscriptionSignupFormProps) {
  const createSubscription = useCreateSubscription();
  const { data: menuItems, isLoading: menuLoading } = useMenu();

  const [selectedTier, setSelectedTier] = useState<'drink' | 'combo'>(initialTier);
  const [selectedDuration, setSelectedDuration] = useState<'1w' | '1m' | '3m'>('1m');
  const [subError, setSubError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      tier: initialTier,
      duration: '1m',
    },
  });

  // Sync initialTier → form value on mount
  useEffect(() => {
    setValue('tier', initialTier);
    setSelectedTier(initialTier);
  }, [initialTier, setValue]);

  const onSubmit = async (data: SubscriptionFormData) => {
    setSubError(null);
    try {
      const default_items: Array<{ menu_item_id: number; quantity: number }> = [
        { menu_item_id: data.drink_item_id, quantity: 1 },
      ];
      if (data.tier === 'combo' && data.food_item_id) {
        default_items.push({ menu_item_id: data.food_item_id, quantity: 1 });
      }

      await createSubscription.mutateAsync({
        tier: data.tier,
        pickup_time: data.pickup_time,
        duration: data.duration,
        default_items,
      });

      reset();
      onSuccess();
    } catch (error: any) {
      setSubError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to create subscription'
      );
    }
  };

  const handleClose = () => {
    reset();
    setSubError(null);
    setSelectedTier(initialTier);
    setSelectedDuration('1m');
    onClose();
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(30, 18, 10, 0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 24px 80px rgba(45, 30, 23, 0.28), 0 4px 16px rgba(45, 30, 23, 0.12)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-coffee-oyster px-8 py-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-semibold text-coffee-oil">Start Your Subscription</h2>
            <p className="text-coffee-roman text-sm mt-0.5">Daily coffee, ready at your time</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-coffee-roman hover:text-coffee-oil hover:bg-coffee-oyster/30 text-xl leading-none"
            style={{ transition: 'background-color 150ms ease, color 150ms ease' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {subError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{subError}</p>
              </div>
            )}

            {/* Tier selector */}
            <div>
              <p className="text-sm font-semibold text-coffee-oil mb-3">Choose your plan</p>
              <div className="grid grid-cols-2 gap-3">
                {(['drink', 'combo'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      setSelectedTier(tier);
                      setValue('tier', tier);
                    }}
                    className={`text-left p-4 rounded-xl border-2 ${
                      selectedTier === tier
                        ? 'border-coffee-judge bg-amber-50'
                        : 'border-coffee-oyster hover:border-coffee-roman'
                    }`}
                    style={{ transition: 'border-color 150ms ease, background-color 150ms ease' }}
                  >
                    <p className="font-bold text-coffee-oil text-sm">
                      {tier === 'drink' ? 'Daily Drink' : 'Daily Combo'}
                    </p>
                    <p className="text-coffee-judge font-bold text-lg">
                      ${tier === 'drink' ? '5' : '9'}
                      <span className="text-sm font-normal text-coffee-roman">/day</span>
                    </p>
                    <p className="text-xs text-coffee-roman mt-1">
                      {tier === 'drink' ? 'One drink · $35/week' : 'Drink + food · $63/week'}
                    </p>
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('tier')} />
              {(errors as any).tier && (
                <p className="text-red-600 text-sm mt-2">{(errors as any).tier?.message}</p>
              )}
            </div>

            {/* Drink selector */}
            <div>
              <label htmlFor="sub-drink" className="block text-sm font-semibold text-coffee-oil mb-2">
                Daily Drink *
              </label>
              <select
                id="sub-drink"
                {...register('drink_item_id', { valueAsNumber: true })}
                disabled={menuLoading}
                className="w-full px-4 py-2.5 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent disabled:opacity-50 bg-white text-coffee-oil"
              >
                <option value="">Select a drink...</option>
                {menuItems
                  ?.filter((m) => m.category === 'hot' || m.category === 'cold')
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ${parseFloat(item.price).toFixed(2)}
                    </option>
                  ))}
              </select>
              {(errors as any).drink_item_id && (
                <p className="text-red-600 text-sm mt-2">{(errors as any).drink_item_id?.message}</p>
              )}
            </div>

            {/* Food selector — combo only */}
            {selectedTier === 'combo' && (
              <div>
                <label htmlFor="sub-food" className="block text-sm font-semibold text-coffee-oil mb-2">
                  Daily Food Item *
                </label>
                <select
                  id="sub-food"
                  {...register('food_item_id', { valueAsNumber: true })}
                  disabled={menuLoading}
                  className="w-full px-4 py-2.5 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent disabled:opacity-50 bg-white text-coffee-oil"
                >
                  <option value="">Select a food item...</option>
                  {menuItems
                    ?.filter((m) => m.category === 'food')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — ${parseFloat(item.price).toFixed(2)}
                      </option>
                    ))}
                </select>
                {(errors as any).food_item_id && (
                  <p className="text-red-600 text-sm mt-2">{(errors as any).food_item_id?.message}</p>
                )}
              </div>
            )}

            {/* Pickup time */}
            <div>
              <label htmlFor="sub-time" className="block text-sm font-semibold text-coffee-oil mb-2">
                Daily Pickup Time *
              </label>
              <select
                id="sub-time"
                {...register('pickup_time')}
                className="w-full px-4 py-2.5 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white text-coffee-oil"
              >
                <option value="">Select a pickup time...</option>
                {Array.from({ length: (15 - 6) * 4 }, (_, i) => {
                  const totalMinutes = 6 * 60 + i * 15;
                  const hour = Math.floor(totalMinutes / 60);
                  const minute = totalMinutes % 60;
                  const hh = String(hour).padStart(2, '0');
                  const mm = String(minute).padStart(2, '0');
                  const value = `${hh}:${mm}`;
                  const label = new Date(0, 0, 0, hour, minute).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {(errors as any).pickup_time && (
                <p className="text-red-600 text-sm mt-2">{(errors as any).pickup_time?.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <p className="text-sm font-semibold text-coffee-oil mb-3">Subscription Length *</p>
              <div className="flex gap-2 flex-wrap">
                {(['1w', '1m', '3m'] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setSelectedDuration(dur);
                      setValue('duration', dur);
                    }}
                    className={`px-5 py-2 rounded-full font-semibold text-sm ${
                      selectedDuration === dur
                        ? 'bg-coffee-judge text-white'
                        : 'bg-coffee-oyster/20 text-coffee-roman hover:bg-coffee-oyster/40'
                    }`}
                    style={{ transition: 'background-color 150ms ease' }}
                  >
                    {DURATION_LABELS[dur]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-coffee-roman mt-2">
                Ends{' '}
                {computeEndDate(selectedDuration).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <input type="hidden" {...register('duration')} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createSubscription.isPending}
                className="flex-[2] bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg"
                style={{ transition: 'background-color 150ms ease' }}
              >
                {createSubscription.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </span>
                ) : (
                  'Start Subscription'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-coffee-oyster/20 hover:bg-coffee-oyster/40 text-coffee-oil font-semibold py-3 rounded-lg"
                style={{ transition: 'background-color 150ms ease' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
