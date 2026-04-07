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
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-8">My Orders</h1>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              Error loading orders. Please try again.
            </div>
          )}

          {!isLoading && orders && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-600">No orders yet. Start by browsing the menu!</p>
              <a
                href="/menu"
                className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg"
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
                    className="bg-white rounded-lg shadow p-6 border border-stone-200"
                  >
                    {/* Header with Order ID and Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-stone-900">
                          Order #{order.id}
                        </h2>
                        <p className="text-sm text-stone-500 mt-1">{formattedDate}</p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Progress Stepper */}
                    <div className="mb-6">
                      <OrderProgressStepper status={order.status} />
                    </div>

                    {/* Items Summary */}
                    <div className="mb-6 border-t border-stone-200 pt-4">
                      <h3 className="font-medium text-stone-900 mb-3">Items</h3>
                      <div className="space-y-2">
                        {enrichedItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm text-stone-700"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>
                              ${(
                                parseFloat(item.price) * item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total and Check-in Button */}
                    <div className="flex justify-between items-center border-t border-stone-200 pt-4">
                      <div className="text-lg font-semibold text-stone-900">
                        Total: ${order.total_amount}
                      </div>

                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCheckIn(order.id)}
                          disabled={isCheckingIn}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition"
                        >
                          {isCheckingIn ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Checking In...
                            </>
                          ) : (
                            "I'm Here"
                          )}
                        </button>
                      )}
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
