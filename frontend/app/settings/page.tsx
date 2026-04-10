'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { useUser, useUpdateUser, useChangeEmail, useChangePassword, useDeleteAccount } from '@/lib/hooks/useUser';
import {
  useSubscription,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from '@/lib/hooks/useSubscription';
import { useMenu } from '@/lib/hooks/useMenu';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  license_plate: z.string().optional().nullable(),
});

const changeEmailSchema = z.object({
  new_email: z.string().email('Invalid email address'),
  current_password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

const subscriptionFormSchema = z.object({
  tier: z.enum(['drink', 'combo'] as const),
  drink_item_id: z.coerce.number().int().positive('Please select a drink'),
  food_item_id: z.coerce.number().int().positive().optional(),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, 'Select a pickup time'),
  duration: z.enum(['1w', '1m', '3m'] as const),
}).refine((d) => d.tier !== 'combo' || (d.food_item_id !== undefined && d.food_item_id > 0), {
  message: 'Please select a food item for the Daily Combo',
  path: ['food_item_id'],
}) as any;

type UpdateProfileData = z.infer<typeof updateProfileSchema>;
type ChangeEmailData = z.infer<typeof changeEmailSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type DeleteAccountData = z.infer<typeof deleteAccountSchema>;
type SubscriptionFormData = {
  tier: 'drink' | 'combo';
  drink_item_id: number;
  food_item_id?: number;
  pickup_time: string;
  duration: '1w' | '1m' | '3m';
};

const DURATION_LABELS: Record<string, string> = {
  '1w': '1 Week',
  '1m': '1 Month',
  '3m': '3 Months',
};

function computeEndDate(duration: '1w' | '1m' | '3m'): Date {
  const d = new Date();
  if (duration === '1w') d.setDate(d.getDate() + 7);
  else if (duration === '1m') d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d;
}

function SettingsContent() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: menuItems, isLoading: menuLoading } = useMenu();
  const updateUser = useUpdateUser();
  const changeEmail = useChangeEmail();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();

  const [showSubForm, setShowSubForm] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'drink' | 'combo'>('drink');
  const [selectedDuration, setSelectedDuration] = useState<'1w' | '1m' | '3m'>('1m');

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
    setValue: setSubValue,
    formState: { errors: subErrors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      tier: 'drink',
      duration: '1m',
    },
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors, isSubmitting: emailSubmitting },
  } = useForm<ChangeEmailData>({ resolver: zodResolver(changeEmailSchema) });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
  } = useForm<ChangePasswordData>({ resolver: zodResolver(changePasswordSchema) });

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors, isSubmitting: deleteSubmitting },
  } = useForm<DeleteAccountData>({ resolver: zodResolver(deleteAccountSchema) });

  const onUpdateProfile = async (data: UpdateProfileData) => {
    try {
      await updateUser.mutateAsync(data);
      alert('Profile updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onChangeEmail = async (data: ChangeEmailData) => {
    try {
      await changeEmail.mutateAsync(data);
      resetEmail();
      alert('Email updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update email');
    }
  };

  const onChangePassword = async (data: ChangePasswordData) => {
    try {
      await changePassword.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      resetPwd();
      alert('Password updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update password');
    }
  };

  const onDeleteAccount = async (data: DeleteAccountData) => {
    try {
      await deleteAccount.mutateAsync(data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete account');
    }
  };

  const onCreateSubscription = async (data: SubscriptionFormData) => {
    setSubError(null);
    try {
      const default_items: Array<{ menu_item_id: number; quantity: number }> = [
        { menu_item_id: data.drink_item_id, quantity: 1 },
      ];
      if (data.tier === 'combo' && data.food_item_id) {
        default_items.push({ menu_item_id: data.food_item_id, quantity: 1 });
      }

      await createSubscription.mutateAsync({
        tier: data.tier,
        pickup_time: data.pickup_time,
        duration: data.duration,
        default_items,
      });
      setShowSubForm(false);
      resetSub();
      setSelectedTier('drink');
      setSelectedDuration('1m');
    } catch (error: any) {
      setSubError(
        error.response?.data?.message || error.response?.data?.error || 'Failed to create subscription'
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
        <p className="text-coffee-roman">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-paper-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-coffee-oil mb-2">Settings</h1>
          <p className="text-coffee-roman">Manage your account and preferences</p>
        </div>

        {/* Account Summary */}
        {user && (
          <div className="bg-gradient-to-r from-coffee-parchment to-coffee-oyster border border-coffee-oyster rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-coffee-oil mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-coffee-judge font-semibold uppercase tracking-wide">Email</p>
                <p className="font-medium text-coffee-oil truncate">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-coffee-judge font-semibold uppercase tracking-wide">Phone</p>
                <p className="font-medium text-coffee-oil">
                  {user.phone || <span className="text-amber-600">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-coffee-judge font-semibold uppercase tracking-wide">License Plate</p>
                <p className="font-medium text-coffee-oil">
                  {user.license_plate || <span className="text-amber-600">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-coffee-judge font-semibold uppercase tracking-wide">Member Since</p>
                <p className="font-medium text-coffee-oil">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="card-paper-bg rounded-2xl shadow-paper-lg border border-coffee-oyster p-6 mb-8">
        <h2 className="font-serif text-2xl font-bold text-coffee-oil mb-1">
          Profile Information
        </h2>
        <p className="text-sm text-coffee-roman mb-6">
          Update your personal details
        </p>

        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-coffee-oil mb-2">
                First Name *
              </label>
              <input
                id="first_name"
                {...register('first_name')}
                type="text"
                placeholder="Enter your first name"
                className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
              />
              {errors.first_name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span className="text-lg">⚠</span> {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-semibold text-coffee-oil mb-2">
                Last Name *
              </label>
              <input
                id="last_name"
                {...register('last_name')}
                type="text"
                placeholder="Enter your last name"
                className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
              />
              {errors.last_name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span className="text-lg">⚠</span> {errors.last_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-coffee-oil mb-2">
                Phone <span className="text-coffee-roman font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                {...register('phone')}
                type="tel"
                placeholder="e.g., +1 (555) 000-0000"
                className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="license_plate" className="block text-sm font-semibold text-coffee-oil mb-2">
                License Plate <span className="text-coffee-roman font-normal">(optional)</span>
              </label>
              <input
                id="license_plate"
                {...register('license_plate')}
                type="text"
                placeholder="e.g., ABC-1234"
                className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || updateUser.isPending}
            className="bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
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

        {/* Change Email Section */}
        <div className="card-paper-bg rounded-2xl shadow-paper-lg border border-coffee-oyster p-6 mb-8">
          <h2 className="font-serif text-2xl font-bold text-coffee-oil mb-1">Change Email</h2>
          <p className="text-sm text-coffee-roman mb-6">Update the email address on your account</p>

          <form onSubmit={handleEmailSubmit(onChangeEmail)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="new_email" className="block text-sm font-semibold text-coffee-oil mb-2">
                  New Email *
                </label>
                <input
                  id="new_email"
                  {...registerEmail('new_email')}
                  type="email"
                  placeholder="new@example.com"
                  className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
                />
                {emailErrors.new_email && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span className="text-lg">⚠</span> {emailErrors.new_email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email_current_password" className="block text-sm font-semibold text-coffee-oil mb-2">
                  Current Password *
                </label>
                <input
                  id="email_current_password"
                  {...registerEmail('current_password')}
                  type="password"
                  placeholder="Confirm with your password"
                  className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
                />
                {emailErrors.current_password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span className="text-lg">⚠</span> {emailErrors.current_password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={emailSubmitting || changeEmail.isPending}
              className="bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
            >
              {changeEmail.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Updating Email...
                </span>
              ) : (
                'Update Email'
              )}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="card-paper-bg rounded-2xl shadow-paper-lg border border-coffee-oyster p-6 mb-8">
          <h2 className="font-serif text-2xl font-bold text-coffee-oil mb-1">Change Password</h2>
          <p className="text-sm text-coffee-roman mb-6">Choose a strong password at least 8 characters long</p>

          <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="current_password" className="block text-sm font-semibold text-coffee-oil mb-2">
                  Current Password *
                </label>
                <input
                  id="current_password"
                  {...registerPwd('current_password')}
                  type="password"
                  placeholder="Your current password"
                  className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
                />
                {pwdErrors.current_password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span className="text-lg">⚠</span> {pwdErrors.current_password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-semibold text-coffee-oil mb-2">
                  New Password *
                </label>
                <input
                  id="new_password"
                  {...registerPwd('new_password')}
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
                />
                {pwdErrors.new_password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span className="text-lg">⚠</span> {pwdErrors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-semibold text-coffee-oil mb-2">
                  Confirm New Password *
                </label>
                <input
                  id="confirm_password"
                  {...registerPwd('confirm_password')}
                  type="password"
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
                />
                {pwdErrors.confirm_password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span className="text-lg">⚠</span> {pwdErrors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdSubmitting || changePassword.isPending}
              className="bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
            >
              {changePassword.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Updating Password...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className="card-paper-bg rounded-2xl shadow-paper-lg border border-red-200 p-6 mb-8">
          <h2 className="font-serif text-2xl font-bold text-red-700 mb-1">Delete Account</h2>
          <p className="text-sm text-coffee-roman mb-6">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Delete My Account
            </button>
          ) : (
            <form onSubmit={handleDeleteSubmit(onDeleteAccount)} className="space-y-6 border-t border-red-100 pt-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  This action is irreversible. Enter your password to confirm.
                </p>
              </div>

              <div className="max-w-sm">
                <label htmlFor="delete_password" className="block text-sm font-semibold text-coffee-oil mb-2">
                  Password *
                </label>
                <input
                  id="delete_password"
                  {...registerDelete('password')}
                  type="password"
                  placeholder="Enter your password to confirm"
                  className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {deleteErrors.password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span className="text-lg">⚠</span> {deleteErrors.password.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={deleteSubmitting || deleteAccount.isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
                >
                  {deleteAccount.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Deleting Account...
                    </span>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-coffee-oyster hover:bg-coffee-oyster text-coffee-oil font-bold py-3 px-8 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Subscription Section */}
        <div className="card-paper-bg rounded-2xl shadow-md border border-coffee-oyster p-6">
          <h2 className="font-serif text-2xl font-bold text-coffee-oil mb-1">Daily Subscription</h2>
          <p className="text-sm text-coffee-roman mb-6">
            Set up a recurring daily coffee order with a fixed weekly allowance
          </p>

          {subLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-coffee-oyster rounded w-1/4"></div>
              <div className="h-4 bg-coffee-oyster rounded w-1/3"></div>
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-4">
                  Active Subscription
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Plan</p>
                    <p className="font-medium text-emerald-900 text-lg">
                      {subscription.tier === 'combo' ? 'Daily Combo' : 'Daily Drink'}
                    </p>
                    <p className="text-xs text-emerald-600">
                      ${subscription.tier === 'combo' ? '9' : '5'}/day · ${parseFloat(subscription.weekly_allowance).toFixed(0)}/week
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Pickup Time</p>
                    <p className="font-medium text-emerald-900 text-lg">
                      {(() => {
                        const [h, m] = subscription.pickup_time.split(':').map(Number);
                        const d = new Date(); d.setHours(h, m);
                        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Active Until</p>
                    <p className="font-medium text-emerald-900 text-lg">
                      {new Date(subscription.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Daily items */}
                {subscription.default_items && subscription.default_items.length > 0 && menuItems && (
                  <div className="mb-4">
                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-2">Daily Order</p>
                    <div className="flex flex-wrap gap-2">
                      {(subscription.default_items as Array<{ menu_item_id: number; quantity: number }>).map(item => {
                        const menuItem = menuItems.find(m => m.id === item.menu_item_id);
                        return menuItem ? (
                          <span key={item.menu_item_id} className="bg-white border border-emerald-200 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium">
                            {menuItem.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Usage bar */}
                <div>
                  <div className="flex justify-between text-xs text-emerald-700 mb-2">
                    <span>Weekly Usage</span>
                    <span>${parseFloat(subscription.used_amount).toFixed(2)} / ${parseFloat(subscription.weekly_allowance).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((parseFloat(subscription.used_amount) / parseFloat(subscription.weekly_allowance)) * 100, 100)}%`,
                        transition: 'width 400ms ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCancelSubscription}
                disabled={cancelSubscription.isPending}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
              >
                {cancelSubscription.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          ) : (
            <div>
              {!showSubForm ? (
                <div>
                  {/* Tier preview cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-coffee-oyster rounded-2xl p-5">
                      <p className="font-serif font-bold text-coffee-oil text-lg mb-1">Daily Drink</p>
                      <p className="text-coffee-judge font-bold text-2xl mb-1">$5<span className="text-sm font-normal text-coffee-roman">/day</span></p>
                      <p className="text-sm text-coffee-roman">One drink of your choice, every day. $35/week allowance.</p>
                    </div>
                    <div className="border border-coffee-oyster rounded-2xl p-5">
                      <p className="font-serif font-bold text-coffee-oil text-lg mb-1">Daily Combo</p>
                      <p className="text-coffee-judge font-bold text-2xl mb-1">$9<span className="text-sm font-normal text-coffee-roman">/day</span></p>
                      <p className="text-sm text-coffee-roman">A drink + food item daily. $63/week allowance.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSubForm(true)}
                    className="w-full bg-coffee-judge hover:bg-coffee-oil text-white font-bold py-3 rounded-lg transition"
                  >
                    Set Up Subscription
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubSubmit(onCreateSubscription)} className="space-y-6 border-t pt-6">
                  {subError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <span className="text-red-600 text-lg">!</span>
                      <p className="text-red-800 text-sm">{subError}</p>
                    </div>
                  )}

                  {/* Tier selector */}
                  <div>
                    <p className="text-sm font-semibold text-coffee-oil mb-3">Choose your plan *</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(['drink', 'combo'] as const).map(tier => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => {
                            setSelectedTier(tier);
                            setSubValue('tier', tier);
                          }}
                          className={`text-left p-4 rounded-xl border-2 transition-colors ${
                            selectedTier === tier
                              ? 'border-coffee-judge bg-coffee-cream'
                              : 'border-coffee-oyster hover:border-coffee-roman'
                          }`}
                          style={{ transition: 'border-color 150ms ease, background-color 150ms ease' }}
                        >
                          <p className="font-bold text-coffee-oil">
                            {tier === 'drink' ? 'Daily Drink' : 'Daily Combo'}
                          </p>
                          <p className="text-coffee-judge font-bold text-lg">
                            ${tier === 'drink' ? '5' : '9'}<span className="text-sm font-normal text-coffee-roman">/day</span>
                          </p>
                          <p className="text-xs text-coffee-roman mt-1">
                            {tier === 'drink' ? 'One drink daily · $35/week' : 'Drink + food daily · $63/week'}
                          </p>
                        </button>
                      ))}
                    </div>
                    <input type="hidden" {...registerSub('tier')} />
                    {(subErrors as any).tier && (
                      <p className="text-red-600 text-sm mt-2">{(subErrors as any).tier?.message}</p>
                    )}
                  </div>

                  {/* Drink selector */}
                  <div>
                    <label htmlFor="drink_item_id" className="block text-sm font-semibold text-coffee-oil mb-2">
                      Daily Drink *
                    </label>
                    <select
                      id="drink_item_id"
                      {...registerSub('drink_item_id', { valueAsNumber: true })}
                      disabled={menuLoading}
                      className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent disabled:opacity-50 bg-white"
                    >
                      <option value="">Select a drink...</option>
                      {menuItems?.filter(m => m.category === 'hot' || m.category === 'cold').map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} — ${parseFloat(item.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {(subErrors as any).drink_item_id && (
                      <p className="text-red-600 text-sm mt-2">{(subErrors as any).drink_item_id?.message}</p>
                    )}
                  </div>

                  {/* Food selector (combo only) */}
                  {selectedTier === 'combo' && (
                    <div>
                      <label htmlFor="food_item_id" className="block text-sm font-semibold text-coffee-oil mb-2">
                        Daily Food Item *
                      </label>
                      <select
                        id="food_item_id"
                        {...registerSub('food_item_id', { valueAsNumber: true })}
                        disabled={menuLoading}
                        className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent disabled:opacity-50 bg-white"
                      >
                        <option value="">Select a food item...</option>
                        {menuItems?.filter(m => m.category === 'food').map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} — ${parseFloat(item.price).toFixed(2)}
                          </option>
                        ))}
                      </select>
                      {(subErrors as any).food_item_id && (
                        <p className="text-red-600 text-sm mt-2">{(subErrors as any).food_item_id?.message}</p>
                      )}
                    </div>
                  )}

                  {/* Pickup time */}
                  <div>
                    <label htmlFor="pickup_time" className="block text-sm font-semibold text-coffee-oil mb-2">
                      Daily Pickup Time *
                    </label>
                    <input
                      id="pickup_time"
                      type="time"
                      step="300"
                      {...registerSub('pickup_time')}
                      className="w-full px-4 py-2 border border-coffee-roman rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-judge focus:border-transparent"
                    />
                    {(subErrors as any).pickup_time && (
                      <p className="text-red-600 text-sm mt-2">{(subErrors as any).pickup_time?.message}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-sm font-semibold text-coffee-oil mb-3">Subscription Length *</p>
                    <div className="flex gap-3 flex-wrap">
                      {(['1w', '1m', '3m'] as const).map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => {
                            setSelectedDuration(dur);
                            setSubValue('duration', dur);
                          }}
                          className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                            selectedDuration === dur
                              ? 'bg-coffee-judge text-white'
                              : 'bg-coffee-oyster/20 text-coffee-roman hover:bg-coffee-oyster/40'
                          }`}
                          style={{ transition: 'background-color 150ms ease' }}
                        >
                          {DURATION_LABELS[dur]}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-coffee-roman mt-2">
                      Ends {computeEndDate(selectedDuration).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <input type="hidden" {...registerSub('duration')} />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createSubscription.isPending}
                      className="flex-1 bg-coffee-judge hover:bg-coffee-oil disabled:bg-coffee-oyster disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
                    >
                      {createSubscription.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Creating...
                        </span>
                      ) : (
                        'Start Subscription'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubForm(false);
                        setSubError(null);
                        resetSub();
                        setSelectedTier('drink');
                        setSelectedDuration('1m');
                      }}
                      className="flex-1 bg-coffee-oyster/30 hover:bg-coffee-oyster/50 text-coffee-oil font-bold py-3 rounded-lg transition"
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
