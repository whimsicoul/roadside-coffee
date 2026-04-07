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

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

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

  const onUpdateProfile = async (data: UpdateProfileData) => {
    try {
      await updateUser.mutateAsync(data);
      alert('Profile updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCreateSubscription = async () => {
    setSubError(null);
    const startDate = (
      document.getElementById('startDate') as HTMLInputElement
    )?.value;
    const endDate = (document.getElementById('endDate') as HTMLInputElement)
      ?.value;
    const allowance = (
      document.getElementById('allowance') as HTMLInputElement
    )?.value;

    if (!startDate || !endDate || !allowance) {
      setSubError('All fields are required');
      return;
    }

    try {
      await createSubscription.mutateAsync({
        start_date: startDate,
        end_date: endDate,
        weekly_allowance: parseFloat(allowance),
      });
      setShowSubForm(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-stone-900 mb-8">Settings</h1>

      {/* Account Summary */}
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Account Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">Email</p>
              <p className="font-medium text-blue-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Phone</p>
              <p className="font-medium text-blue-900">
                {user.phone || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">License Plate</p>
              <p className="font-medium text-blue-900">
                {user.license_plate || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Member Since</p>
              <p className="font-medium text-blue-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">
          Profile Information
        </h2>

        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                First Name
              </label>
              <input
                {...register('first_name')}
                type="text"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
              {errors.first_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Last Name
              </label>
              <input
                {...register('last_name')}
                type="text"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
              {errors.last_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                License Plate
              </label>
              <input
                {...register('license_plate')}
                type="text"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || updateUser.isPending}
            className="bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            {updateUser.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Subscription</h2>

        {subLoading ? (
          <p className="text-stone-600">Loading subscription...</p>
        ) : subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-stone-600">Start Date</p>
                <p className="font-medium text-stone-900">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-600">End Date</p>
                <p className="font-medium text-stone-900">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Weekly Allowance</p>
                <p className="font-medium text-stone-900">
                  ${parseFloat(subscription.weekly_allowance).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Used Amount</p>
                <p className="font-medium text-stone-900">
                  ${parseFloat(subscription.used_amount).toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={handleCancelSubscription}
              disabled={cancelSubscription.isPending}
              className="mt-4 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {cancelSubscription.isPending
                ? 'Cancelling...'
                : 'Cancel Subscription'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-stone-600 mb-4">
              You don't have an active subscription yet.
            </p>

            {!showSubForm ? (
              <button
                onClick={() => setShowSubForm(true)}
                className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Create Subscription
              </button>
            ) : (
              <div className="space-y-4 border-t pt-4">
                {subError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                    {subError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Weekly Allowance ($)
                  </label>
                  <input
                    id="allowance"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateSubscription}
                    disabled={createSubscription.isPending}
                    className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold py-2 rounded-lg transition"
                  >
                    {createSubscription.isPending
                      ? 'Creating...'
                      : 'Create Subscription'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSubForm(false);
                      setSubError(null);
                    }}
                    className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-900 font-bold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
