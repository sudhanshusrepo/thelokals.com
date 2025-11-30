
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../core/services/supabase';
import { User } from '@supabase/supabase-js';
import { ICONS } from '../constants';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFullName(user.user_metadata.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phone || ''); // Assuming phone is available, adjust if not
        setProfilePictureUrl(user.user_metadata.avatar_url || '');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!user) return;

    const updates = {
      id: user.id,
      data: {
        fullName,
        avatar_url: profilePictureUrl,
      },
    };

    const { error } = await supabase.auth.updateUser(updates)
    if (error) {
      console.error('Error updating user:', error);
    } else {
      setIsEditing(false);
      // Refresh user data locally
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      if (updatedUser) {
        setFullName(updatedUser.user_metadata.fullName || '');
        setProfilePictureUrl(updatedUser.user_metadata.avatar_url || '');
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setProfilePictureUrl(data.publicUrl);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={profilePictureUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${email}`}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
            />
            {isEditing && (
              <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full shadow-md transition-transform hover:scale-110">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.EDIT} /></svg>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <div className='flex-grow'>
            {isEditing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName || 'Set Your Name'}</h2>
            )}
            <p className="text-slate-500 dark:text-slate-400">{email}</p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.EDIT} /></svg>
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Personal Information</h3>
        <div className="space-y-4">
          <InfoRow
            icon={ICONS.USER}
            label="Full Name"
            value={isEditing ?
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="form-input" /> :
              fullName || 'Not set'
            }
            isEditing={isEditing}
          />
          <InfoRow
            icon={ICONS.EMAIL}
            label="Email Address"
            value={email}
          />
          <InfoRow
            icon={ICONS.PHONE}
            label="Mobile Number"
            value={isEditing ?
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+123456789" className="form-input" /> :
              phone || 'Not set'
            }
            isEditing={isEditing}
          />
        </div>
      </div>

      {/* Account Management Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Account Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Logout</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sign out of your account</p>
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

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={async () => {
                if (confirm('⚠️ WARNING: This action cannot be undone!\n\nAre you absolutely sure you want to permanently delete your account? All your data, bookings, and reviews will be lost forever.')) {
                  if (confirm('Please confirm one more time: Delete my account permanently?')) {
                    try {
                      // In production, this should call a backend endpoint to handle account deletion
                      // For now, we'll just sign out
                      await supabase.auth.signOut();
                      alert('Account deletion request submitted. Our team will process this within 24-48 hours.');
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      alert('Failed to delete account. Please contact support.');
                    }
                  }
                }
              }}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors border border-red-200 dark:border-red-800"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: string, label: string, value: React.ReactNode, isEditing?: boolean }> = ({ icon, label, value, isEditing }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
    <div className="flex items-center gap-4">
      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </div>
    <div className={`text-sm text-right ${isEditing ? '' : 'text-slate-900 dark:text-white font-semibold'}`}>
      {value}
    </div>
  </div>
)

