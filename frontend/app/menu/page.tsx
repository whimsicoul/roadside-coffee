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
      {/* Editorial Hero Section */}
      <div className="bg-coffee-texture section-paper-bg px-6 py-16 mb-12 border-editorial">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-5xl font-bold mb-3 text-coffee-oil">Good coffee, on the road</h1>
          <p className="text-lg text-coffee-judge mb-6">Order ahead and we'll have it ready when you arrive</p>

          {/* Metadata panels */}
          <div className="flex flex-col md:flex-row justify-center gap-8 mt-8 text-sm">
            <div className="bg-white shadow-paper-md rounded-lg px-4 py-3 border border-coffee-judge">
              <div className="font-serif font-bold text-coffee-oil">Pickup Time</div>
              <div className="text-coffee-judge">5–10 min</div>
            </div>
            <div className="bg-white shadow-paper-md rounded-lg px-4 py-3 border border-coffee-judge">
              <div className="font-serif font-bold text-coffee-oil">Quality</div>
              <div className="text-coffee-judge">Premium Roast</div>
            </div>
            <div className="bg-white shadow-paper-md rounded-lg px-4 py-3 border border-coffee-judge">
              <div className="font-serif font-bold text-coffee-oil">Specialty</div>
              <div className="text-coffee-judge">Artisan Crafted</div>
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
                  <div className="bg-white rounded-lg shadow-paper-lg border border-coffee-judge overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-coffee-judge px-6 py-4 flex items-center gap-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M9 3h6v8c0 1-1 2-2 2h-2c-1 0-2-1-2-2V3z" />
                        <path d="M3 11h18v2H3z" />
                      </svg>
                      <h2 className="font-handwritten text-2xl text-coffee-cream">Hot Drinks</h2>
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
                  <div className="bg-white rounded-lg shadow-paper-lg border border-coffee-judge overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-coffee-judge px-6 py-4 flex items-center gap-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M9 3h6v12H9z" />
                        <path d="M6 15h12v2H6z" />
                        <path d="M9 19h6v2H9z" />
                      </svg>
                      <h2 className="font-handwritten text-2xl text-coffee-cream">Cold Drinks</h2>
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

          {/* Cart sidebar - Order Slip aesthetic */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white rounded-lg shadow-paper-lg border border-coffee-judge overflow-hidden p-6">
              <h2 className="font-serif text-2xl font-bold text-coffee-oil mb-4 pb-2 border-b-2 border-coffee-roman">
                Order Slip
              </h2>
              <OrderSummary items={cart} total={total} />

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-6 bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-coffee-cream font-bold py-3 rounded-lg transition text-base"
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
