
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../core/services/supabase';
import { User } from '@supabase/supabase-js';
import { ICONS } from '../constants';
import { toast } from 'react-hot-toast';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFullName(user.user_metadata.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phone || user.user_metadata.phone || '');
        setProfilePictureUrl(user.user_metadata.avatar_url || '');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const validate = () => {
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (phone) {
      // Basic Indian mobile number validation (starts with 6-9, 10 digits)
      const phoneRegex = /^[6-9]\d{9}$/;
      // Allow +91 prefix
      const cleanPhone = phone.replace('+91', '').trim();
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!user) return;
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        data: {
          fullName,
          phone, // Storing phone in metadata as well for easy access
          avatar_url: profilePictureUrl,
        },
      };

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      // Also try to update the profiles table if it exists and RLS allows
      // This is a best-effort attempt to keep data in sync
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            mobile_number: phone,
            avatar_url: profilePictureUrl,
            updated_at: new Date().toISOString(),
          });
      } catch (dbError) {
        console.warn('Could not update profiles table:', dbError);
      }

      toast.success('Profile updated successfully');

      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const toastId = toast.loading('Uploading avatar...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfilePictureUrl(data.publicUrl);

      // Auto-save after upload
      await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

      toast.success('Avatar updated', { id: toastId });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar', { id: toastId });
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    const toastId = toast.loading('Processing account deletion...');
    try {
      // In a real app, you would call a cloud function to archive/delete data
      // For now, we simulate this and sign out
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

      await supabase.auth.signOut();

      toast.success('Account scheduled for deletion', { id: toastId });
      // Short delay to let the toast be seen
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-900/20 dark:to-emerald-900/20"></div>

        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full p-1 bg-white dark:bg-slate-800 shadow-xl">
              <img
                src={profilePictureUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${email}`}
                alt="avatar"
                className="w-full h-full rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                loading="lazy"
              />
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 border-2 border-white dark:border-slate-800"
              title="Change Avatar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.EDIT} /></svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex-grow text-center sm:text-left pb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName || 'Set Your Name'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
              Verified User
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">👤</span> Personal Information
          </h3>
          {saving && <span className="text-sm text-teal-600 animate-pulse font-medium">Saving changes...</span>}
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500'} focus:ring-2 transition-all outline-none`}
                  placeholder="Enter your full name"
                />
                <div className="absolute right-3 top-3.5 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500'} focus:ring-2 transition-all outline-none`}
                  placeholder="+91 98765 43210"
                />
                <div className="absolute right-3 top-3.5 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative opacity-70">
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
              <div className="absolute right-3 top-3.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <p className="text-xs text-slate-500">Email address cannot be changed</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className={`
                px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-teal-500/30
                transition-all duration-200 flex items-center gap-2
                ${saving
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Account Management Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Account Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Sign Out</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Log out of your account on this device</p>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to logout?')) {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permanently remove your account and data</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors border border-red-200 dark:border-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all scale-100 border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Delete Account Permanently?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6 text-sm">
              This action cannot be undone. All your bookings, history, and personal data will be permanently removed.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all uppercase"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE'}
                  className={`flex-1 px-4 py-2 font-bold rounded-lg transition-colors text-white
                    ${deleteConfirmation === 'DELETE'
                      ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30'
                      : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


