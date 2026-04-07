'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUpdateUser } from '@/lib/hooks/useUser';
import {
  useSubscription,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from '@/lib/hooks/useSubscription';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  license_plate: z.string().optional().nullable(),
});

const subscriptionFormSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  weekly_allowance: z.coerce.number().positive('Allowance must be positive'),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;
type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

function SettingsContent() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const updateUser = useUpdateUser();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();

  const [showSubForm, setShowSubForm] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    values: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone || '',
          license_plate: user.license_plate || '',
        }
      : undefined,
  });

  const {
    register: registerSub,
    handleSubmit: handleSubSubmit,
    reset: resetSub,
    formState: { errors: subErrors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
  });

  const onUpdateProfile = async (data: UpdateProfileData) => {
    try {
      await updateUser.mutateAsync(data);
      alert('Profile updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onCreateSubscription = async (data: SubscriptionFormData) => {
    setSubError(null);
    try {
      await createSubscription.mutateAsync({
        start_date: data.start_date,
        end_date: data.end_date,
        weekly_allowance: data.weekly_allowance,
      });
      setShowSubForm(false);
      resetSub();
      alert('Subscription created successfully');
    } catch (error: any) {
      setSubError(
        error.response?.data?.message || 'Failed to create subscription'
      );
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm('Are you sure you want to cancel your subscription?')
    ) {
      return;
    }

    try {
      await cancelSubscription.mutateAsync();
      alert('Subscription cancelled');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-2">Settings</h1>
          <p className="text-stone-600">Manage your account and preferences</p>
        </div>

        {/* Account Summary */}
        {user && (
          <div className="bg-gradient-to-r from-amber-50 to-stone-100 border border-amber-200 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-amber-900 mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Email</p>
                <p className="font-medium text-amber-900 truncate">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Phone</p>
                <p className="font-medium text-amber-900">
                  {user.phone || <span className="text-amber-600">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">License Plate</p>
                <p className="font-medium text-amber-900">
                  {user.license_plate || <span className="text-amber-600">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Member Since</p>
                <p className="font-medium text-amber-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 mb-8">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">
          Profile Information
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Update your personal details
        </p>

        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-stone-900 mb-2">
                First Name *
              </label>
              <input
                id="first_name"
                {...register('first_name')}
                type="text"
                placeholder="Enter your first name"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
              />
              {errors.first_name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span className="text-lg">⚠</span> {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-semibold text-stone-900 mb-2">
                Last Name *
              </label>
              <input
                id="last_name"
                {...register('last_name')}
                type="text"
                placeholder="Enter your last name"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
              />
              {errors.last_name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span className="text-lg">⚠</span> {errors.last_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-stone-900 mb-2">
                Phone <span className="text-stone-500 font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                {...register('phone')}
                type="tel"
                placeholder="e.g., +1 (555) 000-0000"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="license_plate" className="block text-sm font-semibold text-stone-900 mb-2">
                License Plate <span className="text-stone-500 font-normal">(optional)</span>
              </label>
              <input
                id="license_plate"
                {...register('license_plate')}
                type="text"
                placeholder="e.g., ABC-1234"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || updateUser.isPending}
            className="bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
          >
            {updateUser.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Updating Profile...
              </span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">Subscription</h2>
        <p className="text-sm text-stone-600 mb-6">
          Manage your daily coffee subscription
        </p>

        {subLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-stone-200 rounded w-1/4"></div>
            <div className="h-4 bg-stone-200 rounded w-1/3"></div>
          </div>
        ) : subscription ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-4">
                ✓ Active Subscription
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Start Date</p>
                  <p className="font-medium text-emerald-900 text-lg">
                    {new Date(subscription.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">End Date</p>
                  <p className="font-medium text-emerald-900 text-lg">
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Weekly Allowance</p>
                  <p className="font-medium text-emerald-900 text-lg">
                    ${parseFloat(subscription.weekly_allowance).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Used Amount</p>
                  <p className="font-medium text-emerald-900 text-lg">
                    ${parseFloat(subscription.used_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-emerald-700 mb-2">
                  <span>Weekly Usage</span>
                  <span>{((parseFloat(subscription.used_amount) / parseFloat(subscription.weekly_allowance)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-700 h-2 rounded-full"
                    style={{
                      width: `${Math.min((parseFloat(subscription.used_amount) / parseFloat(subscription.weekly_allowance)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCancelSubscription}
              disabled={cancelSubscription.isPending}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
            >
              {cancelSubscription.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Cancelling Subscription...
                </span>
              ) : (
                'Cancel Subscription'
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-amber-900 text-sm">
                Create a subscription to get daily coffee delivered with a weekly spending allowance.
              </p>
            </div>

            {!showSubForm ? (
              <button
                onClick={() => setShowSubForm(true)}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-lg transition"
              >
                Create Subscription
              </button>
            ) : (
              <form onSubmit={handleSubSubmit(onCreateSubscription)} className="space-y-6 border-t pt-6">
                {subError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <span className="text-red-600 text-lg">⚠</span>
                    <p className="text-red-800 text-sm">{subError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-semibold text-stone-900 mb-2">
                      Start Date *
                    </label>
                    <input
                      id="start_date"
                      type="date"
                      {...registerSub('start_date')}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                    />
                    {subErrors.start_date && (
                      <p className="text-red-600 text-sm mt-2">{subErrors.start_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block text-sm font-semibold text-stone-900 mb-2">
                      End Date *
                    </label>
                    <input
                      id="end_date"
                      type="date"
                      {...registerSub('end_date')}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                    />
                    {subErrors.end_date && (
                      <p className="text-red-600 text-sm mt-2">{subErrors.end_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="weekly_allowance" className="block text-sm font-semibold text-stone-900 mb-2">
                      Weekly Allowance ($) *
                    </label>
                    <input
                      id="weekly_allowance"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      {...registerSub('weekly_allowance')}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent"
                    />
                    {subErrors.weekly_allowance && (
                      <p className="text-red-600 text-sm mt-2">{subErrors.weekly_allowance.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createSubscription.isPending}
                    className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
                  >
                    {createSubscription.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Creating...
                      </span>
                    ) : (
                      'Create Subscription'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubForm(false);
                      setSubError(null);
                      resetSub();
                    }}
                    className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
