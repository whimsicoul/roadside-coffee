'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OrderSummary } from '@/components/OrderSummary';
import { authStorage } from '@/lib/auth';
import type { CartItem, OrderItem } from '@/types';
import Link from 'next/link';

function CheckoutContent() {
  const router = useRouter();
  const { data: user } = useUser();
  const createOrder = useCreateOrder();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    const items: OrderItem[] = cart.map((item) => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
    }));

    try {
      const result = await createOrder.mutateAsync({
        items,
        total_amount: total,
      });

      setOrderId(result.id);
      setOrderPlaced(true);
      sessionStorage.removeItem('cart');
      sessionStorage.removeItem('total');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced && orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Order Placed!
          </h2>
          <p className="text-green-700 mb-4">
            Your order has been successfully placed.
          </p>
          <p className="text-stone-600 mb-6">
            Order ID: <span className="font-bold">#{orderId}</span>
          </p>
          <div className="space-y-2">
            <p className="text-sm text-stone-600">
              You'll be notified when your order is ready for pickup.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Link
              href="/orders"
              className="flex-1 block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center"
            >
              View My Orders
            </Link>
            <Link
              href="/menu"
              className="flex-1 block bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg text-center"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-stone-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              Delivery Details
            </h2>

            {user ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-stone-600">Name</p>
                  <p className="font-medium text-stone-900">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Email</p>
                  <p className="font-medium text-stone-900">{user.email}</p>
                </div>
                {user.license_plate && (
                  <div>
                    <p className="text-sm text-stone-600">License Plate</p>
                    <p className="font-medium text-stone-900">
                      {user.license_plate}
                    </p>
                  </div>
                )}
                <p className="text-sm text-stone-600 mt-4">
                  <Link
                    href="/settings"
                    className="text-amber-800 hover:underline"
                  >
                    Update delivery details
                  </Link>
                </p>
              </div>
            ) : null}
          </div>

          <OrderSummary items={cart} total={total} />
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-bold text-stone-900 mb-4">
              Order Total
            </h3>

            <div className="flex justify-between items-center text-2xl font-bold text-amber-800 mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cart.length === 0}
              className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>

            <Link
              href="/menu"
              className="block text-center mt-3 text-amber-800 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
