'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCancelSubscription, useUpdateSubscription } from '@/lib/hooks/useSubscription';
import { useMenu } from '@/lib/hooks/useMenu';
import type { Subscription } from '@/types';

interface SubscriptionTierCardsProps {
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  subscription?: Subscription | null;
  onSelectTier: (tier: 'drink' | 'combo') => void;
  layout?: 'full' | 'compact';
}

export function SubscriptionTierCards({
  isLoggedIn,
  hasActiveSubscription,
  subscription,
  onSelectTier,
  layout = 'full',
}: SubscriptionTierCardsProps) {
  const isCompact = layout === 'compact';
  const cancelSubscription = useCancelSubscription();
  const updateSubscription = useUpdateSubscription();
  const { data: menuItems } = useMenu();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState(false);
  const [selectedDrinkId, setSelectedDrinkId] = useState<number | ''>('');
  const [selectedFoodId, setSelectedFoodId] = useState<number | ''>('');
  const [selectedPickupTime, setSelectedPickupTime] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // If they already have a subscription, show the management panel
  if (hasActiveSubscription && subscription) {
    if (isCompact) {
      // Compact: just a brief status + manage link
      return (
        <div className="flex items-center justify-between gap-3">
          <p className="text-coffee-judge text-base">You have an active subscription.</p>
          <Link
            href="/plans"
            className="font-semibold text-coffee-oil hover:underline whitespace-nowrap text-base"
          >
            Manage subscription →
          </Link>
        </div>
      );
    }

    // Full: inline management panel
    const tierLabel = subscription.tier === 'drink' ? 'Daily Drink' : 'Daily Combo';
    const tierPrice = subscription.tier === 'drink' ? '$5/day' : '$9/day';
    const endDate = new Date(subscription.end_date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const startDate = new Date(subscription.start_date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const used = parseFloat(subscription.used_amount ?? '0');
    const allowance = parseFloat(subscription.weekly_allowance ?? '0');
    const usedPct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0;

    const [pickupHour, pickupMin] = subscription.pickup_time.split(':').map(Number);
    const pickupDate = new Date();
    pickupDate.setHours(pickupHour, pickupMin);
    const pickupFormatted = pickupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const drinks = menuItems?.filter((m) => m.category === 'hot' || m.category === 'cold') ?? [];
    const foods = menuItems?.filter((m) => m.category === 'food') ?? [];

    // Derive current default items for display
    const currentDrinkId = subscription.default_items?.find(() => true)?.menu_item_id;
    const currentDrinkName = drinks.find((d) => d.id === currentDrinkId)?.name;
    const currentFoodId = subscription.default_items?.[1]?.menu_item_id;
    const currentFoodName = foods.find((f) => f.id === currentFoodId)?.name;

    const openEditOrder = () => {
      setSelectedDrinkId(currentDrinkId ?? '');
      setSelectedFoodId(currentFoodId ?? '');
      setSelectedPickupTime(subscription.pickup_time);
      setOrderError(null);
      setOrderSuccess(false);
      setEditingOrder(true);
    };

    const handleSaveOrder = async () => {
      setOrderError(null);
      if (!selectedDrinkId) {
        setOrderError('Please select a drink.');
        return;
      }
      if (subscription.tier === 'combo' && !selectedFoodId) {
        setOrderError('Please select a food item.');
        return;
      }
      if (!selectedPickupTime) {
        setOrderError('Please select a pickup time.');
        return;
      }
      try {
        const default_items: Array<{ menu_item_id: number; quantity: number }> = [
          { menu_item_id: Number(selectedDrinkId), quantity: 1 },
        ];
        if (subscription.tier === 'combo' && selectedFoodId) {
          default_items.push({ menu_item_id: Number(selectedFoodId), quantity: 1 });
        }
        await updateSubscription.mutateAsync({ default_items, pickup_time: selectedPickupTime });
        setEditingOrder(false);
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 3000);
      } catch (err: any) {
        setOrderError(
          err.response?.data?.message || err.response?.data?.error || 'Failed to update order'
        );
      }
    };

    const handleCancel = async () => {
      setCancelError(null);
      try {
        await cancelSubscription.mutateAsync();
        setConfirmCancel(false);
      } catch (err: any) {
        setCancelError(
          err.response?.data?.message || err.response?.data?.error || 'Failed to cancel subscription'
        );
      }
    };

    return (
      <div className="space-y-6">
        {/* Active badge + tier */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,76,55,0.12)', color: '#634C37' }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: '#4a7c59' }}
                />
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-coffee-oil">{tierLabel}</p>
            <p className="text-coffee-roman text-base">{tierPrice}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman mb-1">
              Pickup time
            </p>
            <p className="text-xl font-bold text-coffee-oil">{pickupFormatted}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-coffee-oyster" />

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman mb-1">
              Started
            </p>
            <p className="text-coffee-oil font-medium">{startDate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman mb-1">
              Renews / Ends
            </p>
            <p className="text-coffee-oil font-medium">{endDate}</p>
          </div>
        </div>

        {/* Weekly allowance bar */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman">
              Weekly allowance
            </p>
            <p className="text-sm text-coffee-judge">
              ${used.toFixed(2)} / ${allowance.toFixed(2)}
            </p>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '6px', background: 'rgba(45,30,23,0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${usedPct}%`,
                background: '#634C37',
                transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          </div>
        </div>

        {/* Change order section */}
        {!editingOrder ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman mb-0.5">
                Daily order
              </p>
              <p className="text-coffee-oil font-medium text-sm">
                {currentDrinkName ?? 'Not set'}
                {subscription.tier === 'combo' && currentFoodName ? ` + ${currentFoodName}` : ''}
              </p>
              {orderSuccess && (
                <p className="text-xs mt-1" style={{ color: '#4a7c59' }}>Order updated</p>
              )}
            </div>
            <button
              type="button"
              onClick={openEditOrder}
              className="text-sm font-semibold text-coffee-oil border border-coffee-oyster rounded-lg px-3 py-1.5 hover:border-coffee-judge bg-white/70"
              style={{ transition: 'border-color 150ms ease' }}
            >
              Change order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman">
              Change daily order
            </p>
            <div>
              <label className="block text-sm text-coffee-judge mb-1">Drink</label>
              <select
                value={selectedDrinkId}
                onChange={(e) => setSelectedDrinkId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white text-coffee-oil text-sm"
              >
                <option value="">Select a drink...</option>
                {drinks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — ${parseFloat(item.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            {subscription.tier === 'combo' && (
              <div>
                <label className="block text-sm text-coffee-judge mb-1">Food item</label>
                <select
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white text-coffee-oil text-sm"
                >
                  <option value="">Select a food item...</option>
                  {foods.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ${parseFloat(item.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm text-coffee-judge mb-1">Pickup time</label>
              <select
                value={selectedPickupTime}
                onChange={(e) => setSelectedPickupTime(e.target.value)}
                className="w-full px-3 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent bg-white text-coffee-oil text-sm"
              >
                <option value="">Select a time...</option>
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
                  return <option key={value} value={value}>{label}</option>;
                })}
              </select>
            </div>
            {orderError && (
              <p className="text-red-600 text-xs">{orderError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={updateSubscription.isPending}
                className="flex-1 font-semibold py-2 rounded-lg bg-coffee-judge text-white hover:bg-coffee-oil text-sm disabled:opacity-50"
                style={{ transition: 'background-color 150ms ease' }}
              >
                {updateSubscription.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setEditingOrder(false); setOrderError(null); }}
                className="flex-1 font-semibold py-2 rounded-lg border border-coffee-oyster text-coffee-oil text-sm hover:border-coffee-judge"
                style={{ transition: 'border-color 150ms ease' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-coffee-oyster" />

        {/* Actions */}
        <div className="flex gap-3">
          {!confirmCancel ? (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="flex-1 font-semibold py-2.5 px-4 rounded-lg border border-coffee-oyster text-coffee-roman bg-white/70 hover:border-red-300 hover:text-red-700 text-base"
              style={{ transition: 'border-color 150ms ease, color 150ms ease' }}
            >
              Cancel plan
            </button>
          ) : (
            <div className="flex-1 space-y-2">
              <p className="text-sm text-coffee-judge text-center">Are you sure?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelSubscription.isPending}
                  className="flex-1 font-semibold py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
                  style={{ transition: 'background-color 150ms ease' }}
                >
                  {cancelSubscription.isPending ? 'Cancelling...' : 'Yes, cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmCancel(false); setCancelError(null); }}
                  className="flex-1 font-semibold py-2 rounded-lg border border-coffee-oyster text-coffee-oil text-sm hover:border-coffee-judge"
                  style={{ transition: 'border-color 150ms ease' }}
                >
                  Keep it
                </button>
              </div>
              {cancelError && (
                <p className="text-red-600 text-xs text-center">{cancelError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // No active subscription — show tier cards
  const tiers = [
    {
      id: 'drink' as const,
      name: 'Daily Drink',
      price: '5',
      weekly: '35',
      description: 'One drink of your choice, every single day.',
      perks: ['Hot or cold drink', '$35 weekly allowance'],
      accent: 'from-amber-50 to-coffee-parchment',
      border: 'border-coffee-oyster hover:border-coffee-judge',
    },
    {
      id: 'combo' as const,
      name: 'Daily Combo',
      price: '9',
      weekly: '63',
      description: 'A drink plus a food item — the full morning routine.',
      perks: ['Drink + food item', '$63 weekly allowance'],
      accent: 'from-stone-50 to-amber-50',
      border: 'border-coffee-oyster hover:border-coffee-oil',
      badge: 'Best Value',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompact ? 'gap-3' : 'gap-5'}`}>
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={`relative rounded-xl border bg-gradient-to-br ${tier.accent} ${tier.border} ${isCompact ? 'p-4' : 'p-6'}`}
          style={{ transition: 'border-color 150ms ease' }}
        >
          {/* Best value badge */}
          {tier.badge && !isCompact && (
            <span className="absolute -top-2.5 right-4 bg-coffee-judge text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
              {tier.badge}
            </span>
          )}

          {/* Tier name + price */}
          <div className={`${isCompact ? 'mb-2' : 'mb-3'}`}>
            <p className={`font-semibold text-coffee-oil ${isCompact ? 'text-base' : 'text-xl'}`}>
              {tier.name}
            </p>
            <p className={`font-bold text-coffee-oil leading-none ${isCompact ? 'text-2xl mt-0.5' : 'text-4xl mt-1'}`}>
              ${tier.price}
              <span className={`font-normal text-coffee-roman ${isCompact ? 'text-sm' : 'text-base'}`}>
                /day
              </span>
            </p>
            {!isCompact && (
              <p className="text-sm text-coffee-roman mt-1">${tier.weekly}/week</p>
            )}
          </div>

          {/* Description */}
          {!isCompact && (
            <p className="text-sm text-coffee-judge mb-4 leading-relaxed">
              {tier.description}
            </p>
          )}

          {/* CTA */}
          {!isLoggedIn ? (
            <Link
              href="/register"
              className={`block w-full text-center font-semibold rounded-lg border border-coffee-oyster text-coffee-judge hover:border-coffee-judge hover:text-coffee-oil bg-white/70 ${isCompact ? 'text-sm py-2 px-3' : 'text-base py-2.5 px-4'}`}
              style={{ transition: 'border-color 150ms ease, color 150ms ease' }}
            >
              Create account to subscribe
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className={`w-full font-semibold rounded-lg bg-coffee-judge text-white hover:bg-coffee-oil ${isCompact ? 'text-sm py-2 px-3' : 'text-base py-2.5 px-4'}`}
              style={{ transition: 'background-color 150ms ease' }}
            >
              Subscribe — ${tier.price}/day
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
