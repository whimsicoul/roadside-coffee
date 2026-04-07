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
    <nav className="bg-amber-800 text-amber-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/menu" className="font-serif text-2xl font-bold text-amber-50 tracking-wide">
          ☕ Roadside Coffee
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-32 rounded-lg bg-amber-700 animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm font-medium">Welcome, {user.first_name}</span>
              <Link href="/menu" className={`transition-colors ${isActive('/menu') ? 'text-amber-200 underline decoration-amber-300' : 'hover:text-amber-200'}`}>
                Menu
              </Link>
              <Link href="/orders" className={`transition-colors ${isActive('/orders') ? 'text-amber-200 underline decoration-amber-300' : 'hover:text-amber-200'}`}>
                My Orders
              </Link>
              <Link href="/settings" className={`transition-colors ${isActive('/settings') ? 'text-amber-200 underline decoration-amber-300' : 'hover:text-amber-200'}`}>
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="border border-amber-200 text-amber-50 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-amber-200 transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="border border-amber-200 text-amber-50 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-900 bg-amber-800 px-4 py-4 space-y-3">
          {user ? (
            <>
              <p className="text-sm font-medium">Welcome, {user.first_name}</p>
              <Link href="/menu" className={`block transition-colors ${isActive('/menu') ? 'text-amber-200' : 'hover:text-amber-200'}`}>
                Menu
              </Link>
              <Link href="/orders" className={`block transition-colors ${isActive('/orders') ? 'text-amber-200' : 'hover:text-amber-200'}`}>
                My Orders
              </Link>
              <Link href="/settings" className={`block transition-colors ${isActive('/settings') ? 'text-amber-200' : 'hover:text-amber-200'}`}>
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left border border-amber-200 text-amber-50 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block hover:text-amber-200 transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="block border border-amber-200 text-amber-50 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
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
