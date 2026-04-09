import type { AuthResponse } from '@/types';

const TOKEN_KEY = 'rc_token';
const USER_KEY = 'rc_user';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser: (): AuthResponse['user'] | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setUser: (user: AuthResponse['user']): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getRole: (): 'customer' | 'admin' | null => {
    if (typeof window === 'undefined') return null;
    const user = authStorage.getUser();
    return (user?.role as 'customer' | 'admin') ?? null;
  },

  isAdmin: (): boolean => {
    return authStorage.getRole() === 'admin';
  },
};
