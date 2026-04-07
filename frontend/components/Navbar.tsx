'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

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
    <nav className="bg-coffee-cream border-b border-coffee-oyster shadow-refined-sm">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/menu"
          className="text-2xl font-semibold text-coffee-oil hover:text-coffee-judge transition-colors flex items-center gap-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coffee-oil">
            <path d="M9 3h6v8c0 1-1 2-2 2h-2c-1 0-2-1-2-2V3z" />
            <path d="M3 11h18v2H3z" />
            <circle cx="6" cy="15" r="2" />
            <circle cx="12" cy="15" r="2" />
            <circle cx="18" cy="15" r="2" />
          </svg>
          Roadside Coffee
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-coffee-oil hover:text-coffee-judge transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          {isLoading ? (
            <div className="h-6 w-32 rounded bg-coffee-oyster animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm text-coffee-judge">Hi, {user.first_name}</span>
              <Link
                href="/menu"
                className={`text-sm font-medium transition-colors ${isActive('/menu') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Menu
              </Link>
              <Link
                href="/orders"
                className={`text-sm font-medium transition-colors ${isActive('/orders') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                My Orders
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors ${isActive('/settings') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="border border-coffee-oil text-coffee-oil hover:bg-coffee-oyster/10 px-4 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-coffee-oil hover:text-coffee-judge transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-coffee-judge text-white hover:bg-coffee-oil px-4 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-coffee-roman bg-coffee-cream px-4 py-4 space-y-3">
          {user ? (
            <>
              <p className="text-sm font-medium text-coffee-judge">Welcome, {user.first_name}</p>
              <Link
                href="/menu"
                className={`block text-sm font-medium transition-colors ${isActive('/menu') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Menu
              </Link>
              <Link
                href="/orders"
                className={`block text-sm font-medium transition-colors ${isActive('/orders') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                My Orders
              </Link>
              <Link
                href="/settings"
                className={`block text-sm font-medium transition-colors ${isActive('/settings') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left border border-coffee-oil text-coffee-oil hover:bg-coffee-oyster px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-sm font-medium text-coffee-oil hover:text-coffee-judge transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block border border-coffee-oil text-coffee-oil hover:bg-coffee-oyster px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
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
