'use client';

import { useState, useMemo } from 'react';
import { useAdminSubscriptions } from '@/lib/hooks/useAdmin';
import { useAdminOrders } from '@/lib/hooks/useAdmin';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import type { AdminOrder, AdminSubscription } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (toLocalDateString(date) === toLocalDateString(today)) return 'Today';
  if (toLocalDateString(date) === toLocalDateString(yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatPickupTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface EnrichedOrderItem {
  menu_item_id: number;
  name: string;
  price: string;
  quantity: number;
}

function getCustomerName(order: AdminOrder): string {
  if (order.user) return `${order.user.first_name} ${order.user.last_name}`;
  if (order.guest_first_name) return `${order.guest_first_name} ${order.guest_last_name ?? ''}`.trim();
  return 'Unknown';
}

// ── Sub-badge ─────────────────────────────────────────────────────────────

function SubscriptionBadge({ subId }: { subId: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Sub #{subId}
    </span>
  );
}

// ── Generated Orders view ─────────────────────────────────────────────────

function GeneratedOrdersView() {
  const today = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const { data, isLoading, error } = useAdminOrders({
    date: selectedDate,
    refetchInterval: 30000,
  });

  const orders = useMemo(
    () => (data?.orders ?? []).filter(o => o.subscription_id != null),
    [data]
  );

  function stepDate(delta: number) {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + delta);
    setSelectedDate(toLocalDateString(next));
  }

  const isToday = selectedDate === today;

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-6 w-6 border-4 border-coffee-judge border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Failed to load orders. Please refresh.
    </div>
  );

  return (
    <div>
      {/* Date navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => stepDate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-coffee-oyster/20 hover:bg-coffee-oyster/40 text-coffee-judge font-bold transition-colors"
          style={{ transition: 'background-color 180ms ease' }}
          aria-label="Previous day"
        >
          ‹
        </button>
        <span className="font-serif font-bold text-coffee-oil text-xl min-w-[120px] text-center">
          {formatDateLabel(selectedDate)}
        </span>
        <button
          onClick={() => stepDate(1)}
          disabled={isToday}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-coffee-oyster/20 hover:bg-coffee-oyster/40 text-coffee-judge font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ transition: 'background-color 180ms ease' }}
          aria-label="Next day"
        >
          ›
        </button>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={e => setSelectedDate(e.target.value)}
          className="ml-1 text-xs text-coffee-roman border border-coffee-oyster rounded-lg px-2 py-1 bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-coffee-judge"
        />
      </div>

      {orders.length === 0 ? (
        <div className="card-paper-bg rounded-2xl border border-coffee-oyster p-10 text-center">
          <p className="text-coffee-roman font-medium">No subscription orders for this day</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map(order => {
            const items = order.items as EnrichedOrderItem[];
            return (
              <div
                key={order.id}
                className="card-paper-bg rounded-2xl border border-coffee-oyster overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(45,30,23,0.07)' }}
              >
                <div className="bg-gradient-to-r from-amber-50 to-transparent px-5 py-4 border-b border-coffee-oyster flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-coffee-oil text-lg">#{order.id}</span>
                      <span className="text-coffee-roman text-sm">{getCustomerName(order)}</span>
                      {order.subscription_id && <SubscriptionBadge subId={order.subscription_id} />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-coffee-roman">
                      <span>
                        {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {order.ready_time && (
                        <span className="text-coffee-judge font-medium">
                          Pickup {new Date(order.ready_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="px-5 py-3 border-b border-coffee-oyster/50">
                  <div className="space-y-1">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-coffee-judge">
                          {item.name}
                          <span className="text-coffee-roman ml-1">× {item.quantity}</span>
                        </span>
                        <span className="text-coffee-oil font-medium">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-3">
                  <span className="font-serif font-bold text-coffee-judge text-xl">
                    ${order.total_amount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Upcoming Orders view ──────────────────────────────────────────────────

function UpcomingOrdersView() {
  const { data, isLoading, error } = useAdminSubscriptions({ refetchInterval: 60000 });

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-6 w-6 border-4 border-coffee-judge border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Failed to load subscriptions. Please refresh.
    </div>
  );

  const subscriptions = data?.subscriptions ?? [];

  if (subscriptions.length === 0) return (
    <div className="card-paper-bg rounded-2xl border border-coffee-oyster p-10 text-center">
      <p className="text-coffee-roman font-medium">No active subscriptions</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-coffee-roman italic">
        Projected orders for the next 7 days based on active subscriptions. Actual orders are generated daily by the scheduler.
      </p>
      {subscriptions.map((sub: AdminSubscription) => (
        <div
          key={sub.id}
          className="card-paper-bg rounded-2xl border border-coffee-oyster overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(45,30,23,0.07)' }}
        >
          {/* Sub header */}
          <div className="bg-gradient-to-r from-coffee-parchment to-transparent px-5 py-4 border-b border-coffee-oyster">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-serif font-bold text-coffee-oil">
                    {sub.user.first_name} {sub.user.last_name}
                  </span>
                  <SubscriptionBadge subId={sub.id} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    sub.tier === 'combo'
                      ? 'bg-coffee-judge/10 text-coffee-judge'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.tier === 'combo' ? 'Daily Combo' : 'Daily Drink'}
                  </span>
                </div>
                <p className="text-xs text-coffee-roman">{sub.user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-coffee-roman">Pickup</p>
                <p className="font-semibold text-coffee-oil">{formatPickupTime(sub.pickup_time)}</p>
              </div>
            </div>
          </div>

          {/* Upcoming days */}
          {sub.upcoming.length === 0 ? (
            <div className="px-5 py-4 text-sm text-coffee-roman italic">
              No upcoming orders (weekly allowance reached or subscription ending soon)
            </div>
          ) : (
            <div className="divide-y divide-coffee-oyster/30">
              {sub.upcoming.map(projected => (
                <div key={projected.date} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-coffee-oil min-w-[80px]">
                      {new Date(projected.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {projected.items.map((item, i) => (
                        <span key={i} className="text-xs bg-coffee-cream border border-coffee-oyster px-2 py-0.5 rounded-full text-coffee-judge">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-coffee-roman">{formatPickupTime(projected.pickup_time)}</span>
                    <span className="font-semibold text-coffee-oil">${projected.total_amount.toFixed(2)}</span>
                    <span className="text-xs text-coffee-roman/60 italic">projected</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function AdminSubscriptionsDashboard() {
  const [subView, setSubView] = useState<'generated' | 'upcoming'>('generated');

  return (
    <div>
      {/* Sub-view tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'generated', label: 'Generated Orders' },
          { key: 'upcoming', label: 'Upcoming (7 Days)' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSubView(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              subView === key
                ? 'bg-coffee-judge text-white'
                : 'bg-coffee-oyster/20 text-coffee-roman hover:bg-coffee-oyster/40'
            }`}
            style={{ transition: 'background-color 180ms ease' }}
          >
            {label}
          </button>
        ))}
      </div>

      {subView === 'generated' ? <GeneratedOrdersView /> : <UpcomingOrdersView />}
    </div>
  );
}
