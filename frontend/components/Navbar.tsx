'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

function CoinLogo() {
  return (
    <Link
      href="/menu"
      aria-label="Roadside Coffee home"
      className="cursor-pointer flex-shrink-0"
      style={{ display: 'block' }}
    >
      <img
        src="/roadside-coffee-logo.png"
        alt="Roadside Coffee logo"
        style={{
          width: '110px',
          height: '110px',
          objectFit: 'contain',
          mixBlendMode: 'multiply',
          display: 'block',
          transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07) rotate(-2deg)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ''; }}
      />
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
