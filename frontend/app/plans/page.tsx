'use client';

import { useState, useEffect } from 'react';
import { authStorage } from '@/lib/auth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { SubscriptionTierCards } from '@/components/SubscriptionTierCards';
import { SubscriptionSignupForm } from '@/components/SubscriptionSignupForm';
import type { Subscription } from '@/types';

export default function PlansPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [signupTier, setSignupTier] = useState<'drink' | 'combo' | null>(null);

  // Hydration-safe: read localStorage only after mount
  useEffect(() => {
    setIsLoggedIn(!!authStorage.getToken());
  }, []);

  const { data: subscription } = useSubscription({ enabled: isLoggedIn });
  const hasActive = !!subscription;

  return (
    <div className="min-h-screen section-paper-bg">
      <div className="max-w-3xl mx-auto px-8 py-16">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-coffee-roman mb-2">
            Daily Plans
          </p>
          <h1
            className="font-handwritten text-coffee-oil"
            style={{
              fontSize: '4rem',
              fontWeight: '400',
              lineHeight: '1.05',
              letterSpacing: '-0.01em',
              fontStyle: 'italic',
            }}
          >
            {hasActive ? 'Your Subscription' : 'Subscribe and never miss your morning'}
          </h1>
          {!hasActive && (
            <p className="text-coffee-judge mt-3" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Pick a plan and we'll have your order ready every day at your time.
            </p>
          )}
        </div>

        {/* Tier cards / active subscription panel */}
        <div
          className="rounded-2xl border border-coffee-oyster p-8"
          style={{
            background: 'linear-gradient(135deg, #FEFDFB 0%, #F5F0E8 100%)',
            boxShadow: '0 2px 12px rgba(45, 30, 23, 0.07)',
          }}
        >
          <SubscriptionTierCards
            isLoggedIn={isLoggedIn}
            hasActiveSubscription={hasActive}
            subscription={subscription ?? null}
            onSelectTier={setSignupTier}
            layout="full"
          />
        </div>
      </div>

      {signupTier && (
        <SubscriptionSignupForm
          initialTier={signupTier}
          onSuccess={() => setSignupTier(null)}
          onClose={() => setSignupTier(null)}
        />
      )}
    </div>
  );
}
