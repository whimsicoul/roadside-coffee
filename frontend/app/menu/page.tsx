'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/lib/hooks/useMenu';
import { MenuItemCard } from '@/components/MenuItemCard';
import { OrderSummary } from '@/components/OrderSummary';
import type { MenuItem, CartItem } from '@/types';

export default function MenuPage() {
  const router = useRouter();
  const { data: menuItems = [], isLoading, error } = useMenu();
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (menuItem: MenuItem) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.menuItem.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
    sessionStorage.setItem('total', total.toString());
    router.push('/checkout');
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          Error loading menu. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-900 to-stone-800 text-amber-50 px-6 py-16 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-5xl font-bold mb-3">Good coffee, on the road</h1>
          <p className="text-xl text-amber-100">Order ahead and we'll have it ready when you arrive</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Our Menu</h2>
          <p className="text-stone-600">Select your favorite coffee items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu items */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-amber-100"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-stone-200 rounded w-3/4"></div>
                      <div className="h-4 bg-stone-200 rounded w-full"></div>
                      <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-12 text-center">
                <p className="text-stone-600 text-lg">No items available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item) => {
                  const cartItem = cart.find(
                    (c) => c.menuItem.id === item.id
                  );
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={cartItem?.quantity || 0}
                      onAdd={handleAddToCart}
                      onRemove={handleRemoveFromCart}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white rounded-2xl shadow-md border border-amber-100 p-6">
              <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Order Summary</h2>
              <OrderSummary items={cart} total={total} />

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-6 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-base"
                aria-label={`Proceed to checkout with ${cart.length} items`}
              >
                {cart.length === 0
                  ? 'Add items to continue'
                  : `Proceed to Checkout (${cart.length})`}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
