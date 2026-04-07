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
      <div className="section-paper-bg px-8 py-32 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-8xl mb-8 text-coffee-oil leading-tight">Good coffee, on the road</h1>
          <p className="text-5xl text-coffee-judge mb-16 max-w-2xl mx-auto leading-relaxed">Order ahead and we'll have it ready when you arrive</p>

          {/* Metadata panels */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-16 flex-wrap">
            <div className="card-elevated shadow-refined-sm rounded px-10 py-8 border border-coffee-oyster">
              <div className="text-xl font-semibold text-coffee-roman uppercase tracking-wider">Pickup Time</div>
              <div className="text-3xl text-coffee-oil font-semibold mt-3">5–10 min</div>
            </div>
            <div className="card-elevated shadow-refined-sm rounded px-10 py-8 border border-coffee-oyster">
              <div className="text-xl font-semibold text-coffee-roman uppercase tracking-wider">Quality</div>
              <div className="text-3xl text-coffee-oil font-semibold mt-3">Premium Roast</div>
            </div>
            <div className="card-elevated shadow-refined-sm rounded px-10 py-8 border border-coffee-oyster">
              <div className="text-xl font-semibold text-coffee-roman uppercase tracking-wider">Specialty</div>
              <div className="text-3xl text-coffee-oil font-semibold mt-3">Artisan Crafted</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: '#FEFDFB',
                      backgroundImage: 'url(/crumpled-paper.svg)',
                      backgroundSize: '600px 600px',
                      backgroundPosition: '0 0',
                      border: '1px solid rgba(160, 140, 120, 0.4)',
                      boxShadow: `
                        0 2px 8px rgba(45, 30, 23, 0.08),
                        0 12px 32px rgba(45, 30, 23, 0.1),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.4)
                      `,
                    }}
                  >
                    {/* Watercolor Header Section - Full Width */}
                    <div
                      style={{
                        position: 'relative',
                        backgroundImage: 'url(/watercolor-hot.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 2rem',
                        borderBottom: '1px solid rgba(120, 100, 80, 0.25)',
                        minHeight: '180px',
                      }}
                    >
                      {/* Handwritten Text Overlaid on Watercolor */}
                      <h2
                        className="font-handwritten text-coffee-cream"
                        style={{
                          fontSize: '4rem',
                          fontWeight: '400',
                          lineHeight: '1.1',
                          letterSpacing: '0.01em',
                          margin: '0',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          textShadow: '0 1px 3px rgba(45, 30, 23, 0.2)',
                        }}
                      >
                        hot drinks
                      </h2>
                    </div>

                    {/* Menu Items */}
                    <div className="divide-y divide-coffee-oyster/30">
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
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: '#FEFDFB',
                      backgroundImage: 'url(/crumpled-paper.svg)',
                      backgroundSize: '600px 600px',
                      backgroundPosition: '100px 100px',
                      border: '1px solid rgba(160, 140, 120, 0.4)',
                      boxShadow: `
                        0 2px 8px rgba(45, 30, 23, 0.08),
                        0 12px 32px rgba(45, 30, 23, 0.1),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.4)
                      `,
                    }}
                  >
                    {/* Watercolor Header Section - Full Width */}
                    <div
                      style={{
                        position: 'relative',
                        backgroundImage: 'url(/watercolor-cold.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 2rem',
                        borderBottom: '1px solid rgba(120, 100, 80, 0.25)',
                        minHeight: '180px',
                      }}
                    >
                      {/* Handwritten Text Overlaid on Watercolor */}
                      <h2
                        className="font-handwritten text-coffee-oil"
                        style={{
                          fontSize: '4rem',
                          fontWeight: '400',
                          lineHeight: '1.1',
                          letterSpacing: '0.01em',
                          margin: '0',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          textShadow: '0 1px 3px rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        cold drinks
                      </h2>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-coffee-oyster/30">
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
            <div className="sticky top-4 card-elevated rounded-lg shadow-refined-lg border border-coffee-oyster overflow-hidden p-10">
              <h2 className="text-4xl text-coffee-oil mb-8 pb-6 border-b border-coffee-oyster font-semibold">
                Order Summary
              </h2>
              <OrderSummary items={cart} total={total} />

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-10 bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition text-3xl"
                aria-label={`Proceed to checkout with ${cart.length} items`}
              >
                {cart.length === 0 ? 'Add items to continue' : `Proceed to Checkout (${cart.length})`}
              </button>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-2xl">
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
