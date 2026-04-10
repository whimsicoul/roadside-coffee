'use client';

import { useState, useMemo } from 'react';
import { AdminRoute } from '@/components/AdminRoute';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useAdminOrders, useAdminUpdateOrderStatus } from '@/lib/hooks/useAdmin';
import type { AdminOrder } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────

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

function getLicensePlate(order: AdminOrder): string | null {
  return order.guest_license_plate ?? null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(dateStr: string): string {
  // Parse as local date to avoid timezone shift
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (toLocalDateString(date) === toLocalDateString(today)) return 'Today';
  if (toLocalDateString(date) === toLocalDateString(yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── Status sort order ─────────────────────────────────────────────────────

const STATUS_ORDER: Record<string, number> = { pending: 0, ready: 1, completed: 2, cancelled: 3 };

// ── Orders Dashboard ─────────────────────────────────────────────────────

function AdminOrdersDashboard() {
  const today = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const { data, isLoading, error, dataUpdatedAt } = useAdminOrders({
    date: selectedDate,
    refetchInterval: 30000,
  });

  const { mutate: updateStatus, isPending } = useAdminUpdateOrderStatus();

  const orders = data?.orders ?? [];

  const visibleOrders = useMemo(() => {
    const filtered =
      statusFilter === 'active'
        ? orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
        : statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    return [...filtered].sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
    );
  }, [orders, statusFilter]);

  const lastRefreshed = dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : '—';

  // Date navigation
  function stepDate(delta: number) {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + delta);
    setSelectedDate(toLocalDateString(next));
  }

  const isToday = selectedDate === today;

  // Daily summary
  const totalOrders = (data?.pendingCount ?? 0) + (data?.readyCount ?? 0) + (data?.completedCount ?? 0) + (data?.cancelledCount ?? 0);
  const dailyTotal = data?.dailyTotal ?? 0;

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-coffee-judge border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
      Failed to load orders. Please refresh.
    </div>
  );

  return (
    <div>
      {/* ── Date Navigation ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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

          {/* Date picker input (small, subtle) */}
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            className="ml-1 text-xs text-coffee-roman border border-coffee-oyster rounded-lg px-2 py-1 bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-coffee-judge"
          />
        </div>

        <p className="text-xs text-coffee-roman hidden sm:block">
          Auto-refreshing · last updated {lastRefreshed}
        </p>
      </div>

      {/* ── Daily Stat Bar ───────────────────────────────────────── */}
      <div className="card-paper-bg border border-coffee-oyster rounded-2xl px-5 py-3 mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        style={{ boxShadow: '0 1px 6px rgba(45,30,23,0.05)' }}>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-coffee-oil">{totalOrders}</span>
          <span className="text-coffee-roman">orders</span>
        </div>
        <div className="w-px h-4 bg-coffee-oyster hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-coffee-oil">${dailyTotal.toFixed(2)}</span>
          <span className="text-coffee-roman">revenue</span>
        </div>
        <div className="w-px h-4 bg-coffee-oyster hidden sm:block" />
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {data?.pendingCount !== undefined && data.pendingCount > 0 && (
            <span className="text-coffee-roman">
              <span className="font-semibold text-coffee-judge">{data.pendingCount}</span> pending
            </span>
          )}
          {data?.readyCount !== undefined && data.readyCount > 0 && (
            <span className="text-coffee-roman">
              <span className="font-semibold text-green-700">{data.readyCount}</span> ready
            </span>
          )}
          {data?.completedCount !== undefined && data.completedCount > 0 && (
            <span className="text-coffee-roman">
              <span className="font-semibold text-stone-500">{data.completedCount}</span> completed
            </span>
          )}
          {data?.cancelledCount !== undefined && data.cancelledCount > 0 && (
            <span className="text-coffee-roman">
              <span className="font-semibold text-red-500">{data.cancelledCount}</span> cancelled
            </span>
          )}
          {totalOrders === 0 && (
            <span className="text-coffee-roman italic">No orders this day</span>
          )}
        </div>
      </div>

      {/* ── Status Filter Tabs ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['active', 'pending', 'ready', 'completed', 'cancelled', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-coffee-judge text-white'
                  : 'bg-coffee-oyster/20 text-coffee-roman hover:bg-coffee-oyster/40'
              }`}
              style={{ transition: 'background-color 180ms ease' }}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-coffee-roman sm:hidden">
          Last updated {lastRefreshed}
        </p>
      </div>

      {visibleOrders.length === 0 && (
        <div className="card-paper-bg rounded-2xl border border-coffee-oyster p-12 text-center">
          <p className="text-coffee-roman font-medium">No orders in this view</p>
        </div>
      )}

      {/* ── Order Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleOrders.map(order => {
          const items = order.items as EnrichedOrderItem[];
          const plate = getLicensePlate(order);
          const isCancelled = order.status === 'cancelled';
          const canMarkReady = order.status === 'pending';
          const canMarkComplete = order.status === 'ready';
          const canCancel = order.status === 'pending' || order.status === 'ready';

          return (
            <div
              key={order.id}
              className={`card-paper-bg rounded-2xl border border-coffee-oyster overflow-hidden transition-opacity ${isCancelled ? 'opacity-50' : ''}`}
              style={{ boxShadow: '0 2px 12px rgba(45,30,23,0.07)' }}
            >
              {/* Card header */}
              <div className="bg-gradient-to-r from-coffee-parchment to-transparent px-5 py-4 border-b border-coffee-oyster flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-serif font-bold text-coffee-oil text-lg">#{order.id}</span>
                    <span className="text-coffee-roman text-sm">{getCustomerName(order)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-coffee-roman">
                    <span>
                      {new Date(order.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {plate && (
                      <span className="bg-coffee-cream border border-coffee-oyster px-2 py-0.5 rounded font-mono font-bold tracking-wider text-coffee-judge">
                        {plate}
                      </span>
                    )}
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items */}
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

              {/* Footer: total + actions */}
              <div className="px-5 py-3 flex items-center justify-between gap-3">
                <span className="font-serif font-bold text-coffee-judge text-xl">
                  ${order.total_amount}
                </span>
                <div className="flex gap-2">
                  {canMarkReady && (
                    <button
                      disabled={isPending}
                      onClick={() => updateStatus({ id: order.id, status: 'ready' })}
                      className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-sm disabled:opacity-50"
                      style={{ transition: 'background-color 180ms ease' }}
                    >
                      Mark Ready
                    </button>
                  )}
                  {canMarkComplete && (
                    <button
                      disabled={isPending}
                      onClick={() => updateStatus({ id: order.id, status: 'completed' })}
                      className="px-4 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-900 font-semibold text-sm disabled:opacity-50"
                      style={{ transition: 'background-color 180ms ease' }}
                    >
                      Complete
                    </button>
                  )}
                  {canCancel && (
                    <button
                      disabled={isPending}
                      onClick={() => updateStatus({ id: order.id, status: 'cancelled' })}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm disabled:opacity-50"
                      style={{ transition: 'background-color 180ms ease' }}
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="text-coffee-roman text-sm italic py-2">Done</span>
                  )}
                  {isCancelled && (
                    <span className="text-red-400 text-sm italic py-2">Cancelled</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Admin Page ────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <AdminRoute>
      <div className="min-h-screen section-paper-bg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-coffee-oil mb-1">Admin Dashboard</h1>
            <p className="text-coffee-roman">Manage orders</p>
          </div>

          <AdminOrdersDashboard />
        </div>
      </div>
    </AdminRoute>
  );
}
