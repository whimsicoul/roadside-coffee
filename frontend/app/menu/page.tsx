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

  // Categorize items into Hot and Cold based on name keywords
  const hotItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes('hot') ||
    item.name.toLowerCase().includes('espresso') ||
    item.name.toLowerCase().includes('americano') ||
    item.name.toLowerCase().includes('latte') ||
    item.name.toLowerCase().includes('cappuccino') ||
    item.name.toLowerCase().includes('mocha')
  );
  const coldItems = menuItems.filter((item) => !hotItems.includes(item));

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
    <div className="min-h-screen section-paper-bg">
      {/* Hero Section */}
      <div className="section-paper-bg px-6 py-24 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl mb-6 text-coffee-oil leading-tight">Good coffee, on the road</h1>
          <p className="text-lg text-coffee-judge mb-12 max-w-2xl mx-auto leading-relaxed">Order ahead and we'll have it ready when you arrive</p>

          {/* Metadata panels */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 flex-wrap">
            <div className="card-elevated shadow-refined-sm rounded px-7 py-5 border border-coffee-oyster">
              <div className="text-xs font-semibold text-coffee-roman uppercase tracking-wider">Pickup Time</div>
              <div className="text-base text-coffee-oil font-semibold mt-2">5–10 min</div>
            </div>
            <div className="card-elevated shadow-refined-sm rounded px-7 py-5 border border-coffee-oyster">
              <div className="text-xs font-semibold text-coffee-roman uppercase tracking-wider">Quality</div>
              <div className="text-base text-coffee-oil font-semibold mt-2">Premium Roast</div>
            </div>
            <div className="card-elevated shadow-refined-sm rounded px-7 py-5 border border-coffee-oyster">
              <div className="text-xs font-semibold text-coffee-roman uppercase tracking-wider">Specialty</div>
              <div className="text-base text-coffee-oil font-semibold mt-2">Artisan Crafted</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu items */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-paper-sm border border-coffee-oyster overflow-hidden animate-pulse h-16"
                  />
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-paper-md border border-coffee-oyster p-12 text-center">
                <p className="text-coffee-judge text-lg">No items available</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Hot Drinks Section */}
                {hotItems.length > 0 && (
                  <div className="card-elevated rounded-lg shadow-refined-md border border-coffee-oyster overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-coffee-gorzka px-8 py-5 flex items-center gap-4">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="flex-shrink-0">
                        <path d="M9 3h6v8c0 1-1 2-2 2h-2c-1 0-2-1-2-2V3z" />
                        <path d="M3 11h18v2H3z" />
                      </svg>
                      <h2 className="text-xl text-coffee-cream font-semibold">Hot Drinks</h2>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-coffee-oyster">
                      {hotItems.map((item) => {
                        const cartItem = cart.find((c) => c.menuItem.id === item.id);
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
                  </div>
                )}

                {/* Cold Drinks Section */}
                {coldItems.length > 0 && (
                  <div className="card-elevated rounded-lg shadow-refined-md border border-coffee-oyster overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-coffee-cappuccino px-8 py-5 flex items-center gap-4">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D1E17" strokeWidth="2" className="flex-shrink-0">
                        <path d="M9 3h6v12H9z" />
                        <path d="M6 15h12v2H6z" />
                        <path d="M9 19h6v2H9z" />
                      </svg>
                      <h2 className="text-xl text-coffee-oil font-semibold">Cold Drinks</h2>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-coffee-oyster">
                      {coldItems.map((item) => {
                        const cartItem = cart.find((c) => c.menuItem.id === item.id);
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 card-elevated rounded-lg shadow-refined-lg border border-coffee-oyster overflow-hidden p-8">
              <h2 className="text-2xl text-coffee-oil mb-6 pb-4 border-b border-coffee-oyster font-semibold">
                Order Summary
              </h2>
              <OrderSummary items={cart} total={total} />

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-8 bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition text-base"
                aria-label={`Proceed to checkout with ${cart.length} items`}
              >
                {cart.length === 0 ? 'Add items to continue' : `Proceed to Checkout (${cart.length})`}
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
