'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/lib/hooks/useMenu';
import { MenuItemCard } from '@/components/MenuItemCard';
import { AdminMenuItemCard, AdminAddItemRow } from '@/components/AdminMenuItemCard';
import { OrderSummary } from '@/components/OrderSummary';
import { useAdminUpdateMenuItem, useAdminDeleteMenuItem, useAdminCreateMenuItem } from '@/lib/hooks/useAdmin';
import { authStorage } from '@/lib/auth';
import type { MenuItem, CartItem } from '@/types';

// Animation styles for the header image and coin toss
const imageAnimationStyles = `
  @keyframes coinToss {
    0%   { transform: translateY(0)      scaleX(1);    }
    8%   { transform: translateY(-30px)  scaleX(0.5);  }
    16%  { transform: translateY(-80px)  scaleX(-1);   }
    24%  { transform: translateY(-115px) scaleX(-0.5); }
    32%  { transform: translateY(-130px) scaleX(1);    }
    40%  { transform: translateY(-115px) scaleX(0.5);  }
    48%  { transform: translateY(-80px)  scaleX(-1);   }
    56%  { transform: translateY(-50px)  scaleX(-0.5); }
    64%  { transform: translateY(-30px)  scaleX(1);    }
    72%  { transform: translateY(-50px)  scaleX(0.5);  }
    80%  { transform: translateY(-80px)  scaleX(-1);   }
    88%  { transform: translateY(-40px)  scaleX(-0.5); }
    94%  { transform: translateY(-8px)   scaleX(1);    }
    97%  { transform: translateY(-3px)   scaleX(1.02); }
    100% { transform: translateY(0)      scaleX(1);    }
  }

  @keyframes gentleFloat {
    0%, 100% {
      transform: translateY(0px) rotateZ(0deg);
    }
    25% {
      transform: translateY(-6px) rotateZ(0.4deg);
    }
    50% {
      transform: translateY(-12px) rotateZ(-0.4deg);
    }
    75% {
      transform: translateY(-6px) rotateZ(0.4deg);
    }
  }

  @keyframes shimmerGlow {
    0%, 100% {
      filter: drop-shadow(0 4px 8px rgba(45, 30, 23, 0.06));
    }
    50% {
      filter: drop-shadow(0 10px 24px rgba(160, 110, 60, 0.16));
    }
  }

  @keyframes subtleBreathing {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.98; }
  }

  .hot-drinks-image {
    animation: gentleFloat 5s cubic-bezier(0.4, 0.0, 0.6, 1.0) infinite,
               shimmerGlow 6s ease-in-out infinite,
               subtleBreathing 8s ease-in-out infinite;
    will-change: transform, filter, opacity;
  }
`;


export default function MenuPage() {
  const router = useRouter();
  const { data: menuItems = [], isLoading, error } = useMenu();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);

  // Detect admin on client side only (authStorage uses localStorage)
  useEffect(() => {
    setIsAdmin(authStorage.isAdmin());
  }, []);

  const { mutate: updateItem, isPending: isUpdating } = useAdminUpdateMenuItem();
  const { mutate: deleteItem, isPending: isDeleting } = useAdminDeleteMenuItem();
  const { mutate: createItem, isPending: isCreating } = useAdminCreateMenuItem();

  const handleAdminSave = (id: number, payload: { name: string; price: number; description?: string; category?: string }) => {
    updateItem({ id, payload: { ...payload, category: payload.category as 'hot' | 'cold' | 'food' | undefined } });
  };

  function handleAdminDelete(id: number, name: string) {
    if (!window.confirm(`Remove "${name}" from the menu?`)) return;
    deleteItem(id);
  }

  const handleAdminAdd = (payload: { name: string; price: number; description?: string; category?: string }) => {
    createItem({ ...payload, category: payload.category as 'hot' | 'cold' | 'food' | undefined });
  };

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

  const hotItems  = menuItems.filter((item) => item.category === 'hot');
  const coldItems = menuItems.filter((item) => item.category === 'cold');
  const foodItems = menuItems.filter((item) => item.category === 'food');

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
      <style>{imageAnimationStyles}</style>
      {/* Logo Header */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ paddingTop: '3.5rem', paddingBottom: '3rem' }}
      >
        <div
          style={{
            width: '260px',
            height: '260px',
            flexShrink: 0,
            cursor: isCoinFlipping ? 'default' : 'pointer',
            animation: isCoinFlipping ? 'coinToss 1000ms ease-in-out forwards' : undefined,
          }}
          onClick={() => { if (!isCoinFlipping) setIsCoinFlipping(true); }}
          onAnimationEnd={() => setIsCoinFlipping(false)}
        >
          <img
            src="/roadside-coffee-logo-coin.png"
            alt="Roadside Coffee"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(45, 30, 23, 0.22)) drop-shadow(0 2px 8px rgba(45, 30, 23, 0.14))',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-8 pb-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
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
              <div className="space-y-8 relative">
                {/* Hot Drinks Section */}
                {hotItems.length > 0 && (
                  <div
                    className="rounded-lg relative"
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
                      overflow: 'visible',
                    }}
                  >
                    {/* Watercolor Header Section - text only, no dark container behind image */}
                    <div
                      style={{
                        position: 'relative',
                        backgroundImage: 'url(/watercolor-hot.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3rem',
                        padding: '2.5rem 4rem 2.5rem 2rem',
                        borderBottom: '1px solid rgba(120, 100, 80, 0.25)',
                        minHeight: '180px',
                        borderRadius: '8px 8px 0 0',
                        overflow: 'visible',
                      }}
                    >
                      {/* Outer: clip + blend. Inner: <img> so filter applies correctly */}
                      <div
                        className="hot-drinks-image"
                        role="img"
                        aria-label="hot drinks illustration"
                        style={{
                          flexShrink: 0,
                          width: '170px',
                          height: '170px',
                          borderRadius: '50%',
                          boxShadow: '0 4px 20px rgba(45,30,23,0.18)',
                          overflow: 'hidden',
                          mixBlendMode: 'multiply',
                        }}
                      >
                        <img
                          src="/hot drink2.png"
                          alt=""
                          style={{
                            width: '170%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: '50% 55%',
                            transform: 'scale(2)',
                            transformOrigin: '40% 60%',
                            filter: 'grayscale(100%) contrast(3) brightness(1.15)',
                          }}
                        />
                      </div>

                      {/* Right: Text */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h2
                          className="font-handwritten text-coffee-cream"
                          style={{
                            fontSize: '5rem',
                            fontWeight: '400',
                            lineHeight: '1.05',
                            letterSpacing: '-0.01em',
                            margin: '0 0 1rem 0',
                            fontStyle: 'italic',
                            textAlign: 'left',
                            textShadow: '0 2px 6px rgba(45, 30, 23, 0.2)',
                            wordSpacing: '0.1em',
                          }}
                        >
                          hot drinks
                        </h2>
                        <div
                          style={{
                            height: '2px',
                            width: '120px',
                            background: 'linear-gradient(90deg, rgba(160, 110, 60, 0.7) 0%, rgba(160, 110, 60, 0.3) 50%, transparent 100%)',
                            borderRadius: '1px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="divide-y divide-coffee-oyster/30" style={{ borderRadius: isAdmin ? '0' : '0 0 8px 8px', overflow: 'hidden' }}>
                      {hotItems.map((item) => {
                        const cartItem = cart.find((c) => c.menuItem.id === item.id);
                        return isAdmin ? (
                          <AdminMenuItemCard
                            key={item.id}
                            item={item}
                            onSave={handleAdminSave}
                            onDelete={handleAdminDelete}
                            isSaving={isUpdating}
                            isDeleting={isDeleting}
                          />
                        ) : (
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
                    {isAdmin && (
                      <AdminAddItemRow onAdd={handleAdminAdd} isAdding={isCreating} />
                    )}
                  </div>
                )}

                {/* Cold Drinks Section */}
                {coldItems.length > 0 && (
                  <div
                    className="rounded-lg overflow-hidden relative"
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
                    {/* Watercolor Header Section */}
                    <div
                      style={{
                        position: 'relative',
                        backgroundImage: 'url(/watercolor-cold.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3rem',
                        padding: '2.5rem 4rem 2.5rem 2rem',
                        borderBottom: '1px solid rgba(120, 100, 80, 0.25)',
                        minHeight: '180px',
                        borderRadius: '8px 8px 0 0',
                        overflow: 'visible',
                      }}
                    >
                      {/* Left: background-image disc — zooms into the jar by controlling bg-size/position */}
                      <div
                        className="hot-drinks-image"
                        role="img"
                        aria-label="iced drinks illustration"
                        style={{
                          flexShrink: 0,
                          width: '170px',
                          height: '170px',
                          borderRadius: '50%',
                          background: '#FEFDFB',
                          boxShadow: '0 4px 20px rgba(45,30,23,0.18)',
                          backgroundImage: 'url(/iced-drink.png)',
                          backgroundSize: '480%',
                          backgroundPosition: '50% 38%',
                          backgroundRepeat: 'no-repeat',
                          mixBlendMode: 'multiply',
                        }}
                      />

                      {/* Right: Text */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h2
                          className="font-handwritten text-coffee-oil"
                          style={{
                            fontSize: '5rem',
                            fontWeight: '400',
                            lineHeight: '1.05',
                            letterSpacing: '-0.01em',
                            margin: '0 0 1rem 0',
                            fontStyle: 'italic',
                            textAlign: 'left',
                            textShadow: '0 2px 6px rgba(45, 30, 23, 0.2)',
                            wordSpacing: '0.1em',
                          }}
                        >
                          cold drinks
                        </h2>
                        <div
                          style={{
                            height: '2px',
                            width: '120px',
                            background: 'linear-gradient(90deg, rgba(160, 110, 60, 0.7) 0%, rgba(160, 110, 60, 0.3) 50%, transparent 100%)',
                            borderRadius: '1px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-coffee-oyster/30 relative z-10">
                      {coldItems.map((item) => {
                        const cartItem = cart.find((c) => c.menuItem.id === item.id);
                        return isAdmin ? (
                          <AdminMenuItemCard
                            key={item.id}
                            item={item}
                            onSave={handleAdminSave}
                            onDelete={handleAdminDelete}
                            isSaving={isUpdating}
                            isDeleting={isDeleting}
                          />
                        ) : (
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
                    {isAdmin && (
                      <AdminAddItemRow onAdd={handleAdminAdd} isAdding={isCreating} />
                    )}
                  </div>
                )}

                {/* Food Section */}
                {foodItems.length > 0 && (
                  <div
                    className="rounded-lg relative"
                    style={{
                      backgroundColor: '#FEFDFB',
                      backgroundImage: 'url(/crumpled-paper.svg)',
                      backgroundSize: '600px 600px',
                      backgroundPosition: '200px 0',
                      border: '1px solid rgba(160, 140, 120, 0.4)',
                      boxShadow: `
                        0 2px 8px rgba(45, 30, 23, 0.08),
                        0 12px 32px rgba(45, 30, 23, 0.1),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.4)
                      `,
                      overflow: 'visible',
                    }}
                  >
                    {/* Watercolor Header Section */}
                    <div
                      style={{
                        position: 'relative',
                        backgroundImage: 'url(/watercolor-food.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3rem',
                        padding: '2.5rem 4rem 2.5rem 2rem',
                        borderBottom: '1px solid rgba(120, 100, 80, 0.25)',
                        minHeight: '180px',
                        borderRadius: '8px 8px 0 0',
                        overflow: 'visible',
                      }}
                    >
                      {/* Circular food image */}
                      <div
                        className="hot-drinks-image"
                        role="img"
                        aria-label="food illustration"
                        style={{
                          flexShrink: 0,
                          width: '170px',
                          height: '170px',
                          borderRadius: '50%',
                          boxShadow: '0 4px 20px rgba(45,30,23,0.18)',
                          overflow: 'hidden',
                          mixBlendMode: 'multiply',
                        }}
                      >
                        <img
                          src="/food.png"
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: '39% 40%',
                            filter: 'grayscale(100%) contrast(3) brightness(1.15)',
                          }}
                        />
                      </div>

                      {/* Title */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h2
                          className="font-handwritten text-coffee-oil"
                          style={{
                            fontSize: '5rem',
                            fontWeight: '400',
                            lineHeight: '1.05',
                            letterSpacing: '-0.01em',
                            margin: '0 0 1rem 0',
                            fontStyle: 'italic',
                            textAlign: 'left',
                            textShadow: '0 2px 6px rgba(45, 30, 23, 0.2)',
                            wordSpacing: '0.1em',
                          }}
                        >
                          food
                        </h2>
                        <div
                          style={{
                            height: '2px',
                            width: '120px',
                            background: 'linear-gradient(90deg, rgba(160, 110, 60, 0.7) 0%, rgba(160, 110, 60, 0.3) 50%, transparent 100%)',
                            borderRadius: '1px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-coffee-oyster/30 relative z-10">
                      {foodItems.map((item) => {
                        const cartItem = cart.find((c) => c.menuItem.id === item.id);
                        return isAdmin ? (
                          <AdminMenuItemCard
                            key={item.id}
                            item={item}
                            onSave={handleAdminSave}
                            onDelete={handleAdminDelete}
                            isSaving={isUpdating}
                            isDeleting={isDeleting}
                          />
                        ) : (
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
                    {isAdmin && (
                      <AdminAddItemRow onAdd={handleAdminAdd} isAdding={isCreating} />
                    )}
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
