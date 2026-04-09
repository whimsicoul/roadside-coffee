'use client';

import { useState } from 'react';
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Orders Dashboard ─────────────────────────────────────────────────────

function AdminOrdersDashboard() {
  const { data, isLoading, error, dataUpdatedAt } = useAdminOrders({ refetchInterval: 30000 });
  const { mutate: updateStatus, isPending } = useAdminUpdateOrderStatus();
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const orders = data?.orders ?? [];

  const visibleOrders = statusFilter === 'active'
    ? orders.filter(o => o.status !== 'completed')
    : statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const lastRefreshed = dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : '—';

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
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['active', 'pending', 'arrived', 'ready', 'completed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-coffee-judge text-white'
                  : 'bg-coffee-oyster/20 text-coffee-roman hover:bg-coffee-oyster/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-coffee-roman">
          Auto-refreshing · last updated {lastRefreshed}
        </p>
      </div>

      {visibleOrders.length === 0 && (
        <div className="card-paper-bg rounded-2xl border border-coffee-oyster p-12 text-center">
          <p className="text-coffee-roman font-medium">No orders in this view</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleOrders.map(order => {
          const items = order.items as EnrichedOrderItem[];
          const plate = getLicensePlate(order);
          const canMarkReady = order.status === 'pending' || order.status === 'arrived';
          const canMarkComplete = order.status === 'ready';

          return (
            <div
              key={order.id}
              className="card-paper-bg rounded-2xl border border-coffee-oyster overflow-hidden"
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
                    <span>{formatDate(order.created_at)}</span>
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
                      className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-sm transition-colors disabled:opacity-50"
                      style={{ transition: 'background-color 180ms ease' }}
                    >
                      Mark Ready
                    </button>
                  )}
                  {canMarkComplete && (
                    <button
                      disabled={isPending}
                      onClick={() => updateStatus({ id: order.id, status: 'completed' })}
                      className="px-4 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-900 font-semibold text-sm transition-colors disabled:opacity-50"
                      style={{ transition: 'background-color 180ms ease' }}
                    >
                      Complete
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="text-coffee-roman text-sm italic py-2">Done</span>
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
