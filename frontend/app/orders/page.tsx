'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { OrderProgressStepper } from '@/components/OrderProgressStepper';
import { useOrders, useCheckIn } from '@/lib/hooks/useOrders';
import { Loader } from 'lucide-react';

interface EnrichedOrderItem {
  menu_item_id: number;
  name: string;
  price: string;
  quantity: number;
}

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders({
    refetchInterval: 15000,
  });
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();

  const handleCheckIn = (orderId: number) => {
    checkIn(orderId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen section-paper-bg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-coffee-oil mb-2">My Orders</h1>
            <p className="text-coffee-roman">Track and manage your coffee orders</p>
          </div>

          {isLoading && (
            <div className="card-paper-bg rounded-2xl shadow-paper-lg border border-coffee-oyster p-12">
              <div className="flex justify-center items-center gap-4">
                <Loader className="w-8 h-8 text-coffee-judge animate-spin" />
                <span className="text-coffee-roman">Loading your orders...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
              <span className="text-red-600 text-2xl">⚠</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Orders</h3>
                <p className="text-red-700">Please try again or contact support.</p>
              </div>
            </div>
          )}

          {!isLoading && orders && orders.length === 0 && (
            <div className="card-paper-bg rounded-2xl shadow-md border border-coffee-oyster p-12 text-center">
              <div className="text-4xl mb-4">☕</div>
              <h2 className="font-serif text-2xl font-bold text-coffee-oil mb-2">No Orders Yet</h2>
              <p className="text-coffee-roman mb-6">Start browsing the menu to place your first order!</p>
              <a
                href="/menu"
                className="inline-block bg-coffee-judge hover:bg-coffee-oil text-white font-bold py-3 px-8 rounded-xl transition"
              >
                Browse Menu
              </a>
            </div>
          )}

          {!isLoading && orders && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const enrichedItems = order.items as EnrichedOrderItem[];
                const orderDate = new Date(order.created_at);
                const formattedDate = orderDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className="card-paper-bg rounded-2xl shadow-paper-lg hover:shadow-paper-xl transition border border-coffee-oyster"
                  >
                    {/* Header with Order ID and Status */}
                    <div className="bg-gradient-to-r from-coffee-parchment to-transparent p-6 border-b border-coffee-oyster flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-coffee-oil mb-1">
                          Order #{order.id}
                        </h2>
                        <p className="text-sm text-coffee-roman">{formattedDate}</p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="p-6">
                      {/* Progress Stepper */}
                      <div className="mb-8">
                        <OrderProgressStepper status={order.status} />
                      </div>

                      {/* Items Summary */}
                      <div className="mb-8">
                        <h3 className="font-serif font-semibold text-coffee-oil mb-4">Order Items</h3>
                        <div className="space-y-3">
                          {enrichedItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-3 bg-coffee-cream/50 rounded-lg"
                            >
                              <span className="text-coffee-judge">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-coffee-roman"> × {item.quantity}</span>
                              </span>
                              <span className="font-semibold text-coffee-oil">
                                ${(
                                  parseFloat(item.price) * item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total and Check-in Button */}
                      <div className="flex justify-between items-center border-t border-coffee-oyster pt-6">
                        <div>
                          <p className="text-xs text-coffee-roman mb-1">Total</p>
                          <p className="text-2xl font-bold text-coffee-judge">
                            ${order.total_amount}
                          </p>
                        </div>

                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCheckIn(order.id)}
                            disabled={isCheckingIn}
                            className="bg-coffee-judge hover:bg-coffee-oil disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition"
                          >
                            {isCheckingIn ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Checking In...</span>
                              </>
                            ) : (
                              <>
                                <span>✓</span>
                                <span>I'm Here</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
