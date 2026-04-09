'use client';

import { useState, useRef } from 'react';
import { AdminRoute } from '@/components/AdminRoute';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useAdminOrders, useAdminUpdateOrderStatus, useAdminCreateMenuItem, useAdminUpdateMenuItem, useAdminDeleteMenuItem } from '@/lib/hooks/useAdmin';
import { useMenu } from '@/lib/hooks/useMenu';
import type { AdminOrder, MenuItem } from '@/types';

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
          <div className="text-4xl mb-3">☕</div>
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

// ── Menu Manager ──────────────────────────────────────────────────────────

function AdminMenuManager() {
  const { data: menuItems, isLoading } = useMenu();
  const { mutate: createItem, isPending: isCreating } = useAdminCreateMenuItem();
  const { mutate: updateItem, isPending: isUpdating } = useAdminUpdateMenuItem();
  const { mutate: deleteItem, isPending: isDeleting } = useAdminDeleteMenuItem();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; price: string; description: string }>({ name: '', price: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<{ name: string; price: string; description: string }>({ name: '', price: '', description: '' });
  const [addError, setAddError] = useState('');

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, price: item.price, description: item.description ?? '' });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    const price = parseFloat(editForm.price);
    if (!editForm.name.trim() || isNaN(price) || price <= 0) return;
    updateItem(
      { id, payload: { name: editForm.name.trim(), price, description: editForm.description.trim() || undefined } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}" from the menu?`)) return;
    deleteItem(id);
  };

  const handleAdd = () => {
    const price = parseFloat(addForm.price);
    if (!addForm.name.trim()) { setAddError('Name is required'); return; }
    if (isNaN(price) || price <= 0) { setAddError('Enter a valid price'); return; }
    setAddError('');
    createItem(
      { name: addForm.name.trim(), price, description: addForm.description.trim() || undefined },
      {
        onSuccess: () => {
          setAddForm({ name: '', price: '', description: '' });
          setShowAddForm(false);
        },
      }
    );
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-coffee-judge border-t-transparent rounded-full" />
    </div>
  );

  const inputCls = 'w-full px-3 py-1.5 rounded-lg border border-coffee-oyster bg-coffee-cream/60 text-coffee-oil text-sm focus:outline-none focus:border-coffee-judge focus:ring-1 focus:ring-coffee-judge/30 transition-colors';

  return (
    <div>
      {/* Add Item Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coffee-judge text-white font-semibold text-sm hover:bg-coffee-oil transition-colors"
          style={{ transition: 'background-color 180ms ease' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card-paper-bg rounded-2xl border border-coffee-oyster p-5 mb-6" style={{ boxShadow: '0 2px 12px rgba(45,30,23,0.07)' }}>
          <h3 className="font-serif font-bold text-coffee-oil text-lg mb-4">New Menu Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-coffee-roman mb-1">Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Oat Latte"
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-coffee-roman mb-1">Price ($) *</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                placeholder="5.00"
                value={addForm.price}
                onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-coffee-roman mb-1">Description</label>
              <input
                className={inputCls}
                placeholder="Optional description"
                value={addForm.description}
                onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          {addError && <p className="text-red-600 text-xs mb-2">{addError}</p>}
          <button
            onClick={handleAdd}
            disabled={isCreating}
            className="px-6 py-2 rounded-xl bg-coffee-judge hover:bg-coffee-oil text-white font-semibold text-sm transition-colors disabled:opacity-50"
            style={{ transition: 'background-color 180ms ease' }}
          >
            {isCreating ? 'Adding…' : 'Add to Menu'}
          </button>
        </div>
      )}

      {/* Menu Table */}
      <div className="card-paper-bg rounded-2xl border border-coffee-oyster overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(45,30,23,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-coffee-parchment border-b border-coffee-oyster">
              <th className="text-left px-5 py-3 font-serif font-semibold text-coffee-oil">Name</th>
              <th className="text-left px-4 py-3 font-serif font-semibold text-coffee-oil w-24">Price</th>
              <th className="text-left px-4 py-3 font-serif font-semibold text-coffee-oil hidden sm:table-cell">Description</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {(menuItems ?? []).map((item, i) => (
              <tr
                key={item.id}
                className={`border-b border-coffee-oyster/40 last:border-0 ${i % 2 === 0 ? '' : 'bg-coffee-cream/30'}`}
              >
                {editingId === item.id ? (
                  <>
                    <td className="px-5 py-2">
                      <input
                        className={inputCls}
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className={inputCls}
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <input
                        className={inputCls}
                        value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-900 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? '…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 rounded-lg bg-coffee-oyster/20 hover:bg-coffee-oyster/40 text-coffee-roman font-semibold text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 font-medium text-coffee-oil">{item.name}</td>
                    <td className="px-4 py-3 text-coffee-judge font-semibold">${parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-coffee-roman hidden sm:table-cell">{item.description ?? <span className="italic text-coffee-oyster">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1 rounded-lg bg-coffee-oyster/20 hover:bg-coffee-oyster/40 text-coffee-roman font-semibold text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={isDeleting}
                          className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {(menuItems ?? []).length === 0 && (
          <div className="py-12 text-center text-coffee-roman">No menu items yet.</div>
        )}
      </div>
    </div>
  );
}

// ── Admin Page ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const { data: ordersData } = useAdminOrders({ refetchInterval: 30000 });

  const activeOrderCount = (ordersData?.orders ?? []).filter(o => o.status !== 'completed').length;

  return (
    <AdminRoute>
      <div className="min-h-screen section-paper-bg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-coffee-oil mb-1">Admin Dashboard</h1>
            <p className="text-coffee-roman">Manage orders and menu items</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-coffee-oyster">
            <button
              onClick={() => setActiveTab('orders')}
              className={`relative pb-3 px-1 mr-6 text-xl font-semibold transition-colors ${
                activeTab === 'orders' ? 'text-coffee-judge' : 'text-coffee-roman hover:text-coffee-judge'
              }`}
            >
              Live Orders
              {activeOrderCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-coffee-cappuccino text-white text-xs font-bold">
                  {activeOrderCount}
                </span>
              )}
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-coffee-judge rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`relative pb-3 px-1 text-xl font-semibold transition-colors ${
                activeTab === 'menu' ? 'text-coffee-judge' : 'text-coffee-roman hover:text-coffee-judge'
              }`}
            >
              Menu Management
              {activeTab === 'menu' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-coffee-judge rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'orders' ? <AdminOrdersDashboard /> : <AdminMenuManager />}
        </div>
      </div>
    </AdminRoute>
  );
}
