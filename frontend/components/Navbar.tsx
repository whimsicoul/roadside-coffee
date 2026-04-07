'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { authStorage } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

export function Navbar() {
  const router = useRouter();
  const { data: user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authStorage.clear();
    queryClient.clear();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <nav className="bg-amber-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/menu" className="text-2xl font-bold">
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
          {user ? (
            <>
              <span className="text-sm">Welcome, {user.first_name}</span>
              <Link href="/menu" className="hover:text-amber-200">
                Menu
              </Link>
              <Link href="/orders" className="hover:text-amber-200">
                My Orders
              </Link>
              <Link href="/settings" className="hover:text-amber-200">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="bg-amber-900 hover:bg-amber-700 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-amber-200">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-amber-900 hover:bg-amber-700 px-4 py-2 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-700 px-4 py-4 space-y-3">
          {user ? (
            <>
              <p className="text-sm">Welcome, {user.first_name}</p>
              <Link href="/menu" className="block hover:text-amber-200">
                Menu
              </Link>
              <Link href="/orders" className="block hover:text-amber-200">
                My Orders
              </Link>
              <Link href="/settings" className="block hover:text-amber-200">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left bg-amber-900 hover:bg-amber-700 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block hover:text-amber-200">
                Login
              </Link>
              <Link
                href="/register"
                className="block bg-amber-900 hover:bg-amber-700 px-4 py-2 rounded"
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
