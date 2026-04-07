'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

const coinShadow =
  '0 6px 20px 0 rgba(30,20,10,0.45), 0 2px 6px 0 rgba(30,20,10,0.25)';
const coinShadowHover =
  '0 10px 28px 0 rgba(30,20,10,0.55), 0 3px 8px 0 rgba(30,20,10,0.30)';

function CoinLogo() {
  return (
    <Link
      href="/menu"
      aria-label="Roadside Coffee home"
      className="cursor-pointer flex-shrink-0"
      style={{ display: 'block' }}
    >
      {/* Outer shadow ring — not clipped so drop-shadow renders fully */}
      <span
        style={{
          display: 'block',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          flexShrink: 0,
          boxShadow: coinShadow,
          transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'scale(1.07) rotate(-2deg)';
          el.style.boxShadow = coinShadowHover;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = '';
          el.style.boxShadow = coinShadow;
        }}
      >
        {/* Clipping shell — overflow:hidden gives perfect circle */}
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            /*
             * Reeded edge matching a real quarter:
             * Fine alternating dark/light slivers (2.5deg each = 72 teeth around the coin)
             * Dark: #8a8880  Light: #d8d4ce
             */
            background:
              'repeating-conic-gradient(' +
              '#8c8a88 0deg, #8c8a88 1.8deg, ' +
              '#dedad6 1.8deg, #dedad6 3.6deg' +
              ')',
          }}
        >
          {/* Main coin face — bright silver like a real quarter */}
          <span
            style={{
              position: 'absolute',
              /* 8px rim = reeded edge width */
              inset: '8px',
              borderRadius: '50%',
              /*
               * Quarter silver: bright highlight at top-left (light source),
               * mid-tone across the face, subtle shadow at bottom-right.
               * Matches the real coin in the reference image.
               */
              background:
                'radial-gradient(ellipse at 38% 28%, #faf9f7 0%, #edeae6 15%, #dedad4 32%, #ccc8c2 50%, #d8d4ce 66%, #e8e4de 80%, #d0ccc6 92%, #c0bcb6 100%)',
              /*
               * Inset shadow: top edge slightly darker (depth rim),
               * bottom-right lighter (reflected light from coin edge)
               */
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.6), ' +
                'inset 0 -1px 0 rgba(0,0,0,0.12), ' +
                'inset 1px 0 0 rgba(255,255,255,0.3), ' +
                'inset -1px 0 0 rgba(0,0,0,0.08), ' +
                'inset 0 4px 16px rgba(0,0,0,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/*
             * Logo as circular coin relief — fills the face, clipped to circle,
             * treated to look like engraved/raised metal rather than a photo.
             */}
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Logo scaled to fill the coin face */}
              <img
                src="/logo2.png"
                alt="Roadside Coffee logo"
                style={{
                  width: '115%',
                  height: '115%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  /*
                   * Engraved metal look:
                   * 1. grayscale — remove color
                   * 2. contrast(3) — crush midtones, only edges/shadows survive
                   * 3. brightness(1.4) — lift result so it reads as raised silver not black blob
                   * 4. invert — make raised areas bright (like real coin relief catching light)
                   * 5. opacity via the overlay below
                   */
                  filter: 'grayscale(1) contrast(3.5) brightness(1.25) invert(1)',
                  mixBlendMode: 'multiply',
                  opacity: 0.45,
                  display: 'block',
                  flexShrink: 0,
                }}
              />
              {/* Subtle metallic overlay to unify logo with coin face */}
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(ellipse at 38% 32%, rgba(248,246,242,0.18) 0%, rgba(200,196,190,0.06) 55%, rgba(160,156,150,0.12) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    authStorage.clear();
    queryClient.clear();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <nav className="bg-coffee-cream border-b border-coffee-oyster shadow-refined-sm" style={{ paddingTop: '4px' }}>
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between gap-6" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        {/* Brand */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <CoinLogo />
          <Link
            href="/menu"
            className="text-5xl font-semibold text-coffee-oil hover:text-coffee-judge transition-colors"
          >
            Roadside Coffee
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-coffee-oil hover:text-coffee-judge transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop: nav links + coin */}
        <div className="hidden md:flex items-center gap-10">
          {isLoading ? (
            <div className="h-6 w-32 rounded bg-coffee-oyster animate-pulse" />
          ) : user ? (
            <>
              <span className="text-3xl text-coffee-judge">Hi, {user.first_name}</span>
              <Link
                href="/menu"
                className={`text-3xl font-medium transition-colors ${isActive('/menu') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Menu
              </Link>
              <Link
                href="/orders"
                className={`text-3xl font-medium transition-colors ${isActive('/orders') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                My Orders
              </Link>
              <Link
                href="/settings"
                className={`text-3xl font-medium transition-colors ${isActive('/settings') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="border border-coffee-oil text-coffee-oil hover:bg-coffee-oyster/10 px-6 py-3 rounded text-2xl font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-3xl font-medium text-coffee-oil hover:text-coffee-judge transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-coffee-judge text-white hover:bg-coffee-oil px-6 py-3 rounded text-2xl font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}

          {/* Quarter coin — rightmost element, mr-2 gives shadow room */}
          <span className="mr-2"><CoinLogo /></span>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-coffee-roman bg-coffee-cream px-6 py-6 space-y-4">
          {user ? (
            <>
              <p className="text-3xl font-medium text-coffee-judge">Welcome, {user.first_name}</p>
              <Link
                href="/menu"
                className={`block text-3xl font-medium transition-colors ${isActive('/menu') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Menu
              </Link>
              <Link
                href="/orders"
                className={`block text-3xl font-medium transition-colors ${isActive('/orders') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                My Orders
              </Link>
              <Link
                href="/settings"
                className={`block text-3xl font-medium transition-colors ${isActive('/settings') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left border border-coffee-oil text-coffee-oil hover:bg-coffee-oyster px-6 py-3 rounded-lg text-2xl font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-3xl font-medium text-coffee-oil hover:text-coffee-judge transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block border border-coffee-oil text-coffee-oil hover:bg-coffee-oyster px-6 py-3 rounded-lg text-2xl font-medium transition-colors text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
