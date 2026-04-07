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
      <div className="min-h-screen section-paper-bg flex items-center justify-center px-8 py-16">
        <div className="card-elevated rounded-lg shadow-refined-lg p-12 max-w-md w-full border border-coffee-oyster">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coffee-gorzka mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-5xl text-coffee-oil mb-4 font-semibold">
              Order Placed!
            </h2>
          </div>

          <div className="bg-coffee-parchment rounded border border-coffee-oyster p-6 mb-8 text-center">
            <p className="text-xl text-coffee-roman mb-2 font-semibold uppercase">Order ID</p>
            <p className="text-4xl text-coffee-oil font-semibold">#{orderId}</p>
          </div>

          <p className="text-coffee-judge text-center mb-10 text-2xl">
            Your order has been successfully placed. You'll be notified when your order is ready for pickup.
          </p>

          <div className="space-y-4">
            <Link
              href="/orders"
              className="block w-full bg-coffee-judge hover:bg-coffee-oil text-white font-semibold py-4 rounded text-center transition text-2xl"
            >
              View My Orders
            </Link>
            <Link
              href="/menu"
              className="block w-full bg-coffee-judge hover:bg-coffee-oil text-white font-semibold py-4 rounded text-center transition text-2xl"
            >
              Place Another Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-paper-bg">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="mb-16">
          <h1 className="text-6xl text-coffee-oil mb-4 font-semibold">Checkout</h1>
          <p className="text-3xl text-coffee-judge">Review and confirm your order</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Details Card */}
            <div className="card-elevated rounded-lg shadow-refined-md border border-coffee-oyster p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl text-coffee-oil font-semibold">
                  Delivery Details
                </h2>
                {user && (
                  <Link
                    href="/settings"
                    className="text-2xl text-coffee-judge hover:text-coffee-oil transition"
                  >
                    Edit
                  </Link>
                )}
              </div>

              {user ? (
                <div className="grid grid-cols-1 gap-7">
                  <div className="border-l-2 border-coffee-oyster pl-6">
                    <p className="text-lg text-coffee-roman mb-2 font-semibold uppercase">Name</p>
                    <p className="font-semibold text-coffee-oil text-2xl">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                  <div className="border-l-2 border-coffee-oyster pl-6">
                    <p className="text-lg text-coffee-roman mb-2 font-semibold uppercase">Email</p>
                    <p className="font-semibold text-coffee-oil text-2xl">{user.email}</p>
                  </div>
                  {user.license_plate ? (
                    <div className="border-l-2 border-coffee-oyster pl-6">
                      <p className="text-lg text-coffee-roman mb-2 font-semibold uppercase">License Plate</p>
                      <p className="font-semibold text-coffee-oil text-2xl">
                        {user.license_plate}
                      </p>
                    </div>
                  ) : (
                    <div className="border-l-2 border-yellow-300 pl-6 bg-yellow-50 p-5 rounded">
                      <p className="text-lg text-coffee-roman mb-2 font-semibold uppercase">License Plate</p>
                      <p className="text-yellow-900 text-2xl">
                        Not set - add it in <Link href="/settings" className="underline font-semibold">Settings</Link>
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Order Items Card */}
            <div className="card-elevated rounded-lg shadow-refined-md border border-coffee-oyster p-10">
              <h3 className="text-3xl text-coffee-oil mb-8 font-semibold">Order Items</h3>
              <OrderSummary items={cart} total={total} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card-elevated rounded-lg shadow-refined-lg border border-coffee-oyster p-10 sticky top-4">
              <h3 className="text-3xl text-coffee-oil mb-10 font-semibold">
                Order Summary
              </h3>

              <div className="space-y-6 mb-10 pb-10 border-b border-coffee-oyster">
                <div className="flex justify-between text-2xl text-coffee-judge">
                  <span>Items</span>
                  <span className="font-semibold">{cart.length}</span>
                </div>
                <div className="flex justify-between text-4xl text-coffee-oil">
                  <span>Total</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cart.length === 0}
                className="w-full bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-4 rounded transition text-3xl"
                aria-busy={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Placing Order...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>

              <Link
                href="/menu"
                className="block text-center mt-4 text-coffee-judge hover:underline text-2xl"
              >
                Continue Shopping
              </Link>
            </div>
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
