'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    authStorage.clear();
    queryClient.clear();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <div className="relative" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-8 flex items-start justify-between gap-6" style={{ paddingTop: '20px', paddingBottom: '12px' }}>
        {/* Spacer to keep auth links right-aligned */}
        <div />

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 transition-opacity"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{ mixBlendMode: 'multiply', opacity: 0.55 }}
        >
          <svg className="w-6 h-6 text-coffee-oil" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop: nav links */}
        <div className="hidden md:flex items-center gap-10">
          {!mounted || isLoading ? (
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
              {user.role === 'admin' ? (
                <Link
                  href="/admin"
                  className={`text-3xl font-medium transition-colors ${isActive('/admin') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
                >
                  Orders
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className={`text-3xl font-medium transition-colors ${isActive('/orders') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
                >
                  My Orders
                </Link>
              )}
              <Link
                href="/settings"
                className={`text-3xl font-medium transition-colors ${isActive('/settings') ? 'text-coffee-judge border-b-2 border-coffee-roman' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  mixBlendMode: 'multiply',
                  background: 'transparent',
                  border: 'none',
                  letterSpacing: '0.06em',
                  opacity: 0.55,
                  transition: 'opacity 220ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.55'; }}
                className="text-coffee-oil text-2xl font-medium cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  mixBlendMode: 'multiply',
                  letterSpacing: '0.06em',
                  opacity: 0.5,
                  transition: 'opacity 220ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.5'; }}
                className="text-3xl font-medium text-coffee-oil"
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  mixBlendMode: 'multiply',
                  letterSpacing: '0.06em',
                  opacity: 0.5,
                  transition: 'opacity 220ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.5'; }}
                className="text-3xl font-medium text-coffee-oil"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && mounted && (
        <div className="md:hidden px-6 py-6 space-y-4" style={{ background: 'transparent' }}>
          {user ? (
            <>
              <p className="text-3xl font-medium text-coffee-judge" style={{ mixBlendMode: 'multiply', opacity: 0.7 }}>Welcome, {user.first_name}</p>
              <Link
                href="/menu"
                className={`block text-3xl font-medium transition-colors ${isActive('/menu') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Menu
              </Link>
              {user.role === 'admin' ? (
                <Link
                  href="/admin"
                  className={`block text-3xl font-medium transition-colors ${isActive('/admin') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
                >
                  Orders
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className={`block text-3xl font-medium transition-colors ${isActive('/orders') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
                >
                  My Orders
                </Link>
              )}
              <Link
                href="/settings"
                className={`block text-3xl font-medium transition-colors ${isActive('/settings') ? 'text-coffee-judge' : 'text-coffee-oil hover:text-coffee-judge'}`}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                style={{ mixBlendMode: 'multiply', opacity: 0.5, background: 'transparent', border: 'none' }}
                className="text-left text-coffee-oil text-2xl font-medium cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ mixBlendMode: 'multiply', opacity: 0.5 }}
                className="block text-3xl font-medium text-coffee-oil"
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{ mixBlendMode: 'multiply', opacity: 0.5 }}
                className="block text-3xl font-medium text-coffee-oil"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
