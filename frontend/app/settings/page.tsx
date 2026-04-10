'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { useUser, useUpdateUser, useChangeEmail, useChangePassword, useDeleteAccount } from '@/lib/hooks/useUser';
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

type UpdateProfileData = z.infer<typeof updateProfileSchema>;
type ChangeEmailData = z.infer<typeof changeEmailSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type DeleteAccountData = z.infer<typeof deleteAccountSchema>;

function SettingsContent() {
  const { data: user, isLoading: userLoading } = useUser();
  const updateUser = useUpdateUser();
  const changeEmail = useChangeEmail();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
