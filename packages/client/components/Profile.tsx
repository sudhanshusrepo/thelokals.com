
import React, { useState, useEffect } from 'react';
import { supabase } from '../../core/services/supabase';
import { User } from '@supabase/supabase-js';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setFullName(user?.user_metadata.fullName || '');
      setEmail(user?.email || '');
      setPhone(user?.phone || '');
      setProfilePicture(user?.user_metadata.avatar_url || '');
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!user) return;

    const { data, error } = await supabase.auth.updateUser({
      data: {
        fullName,
        avatar_url: profilePicture,
      }
    });

    if (error) {
      console.error('Error updating user:', error);
    } else {
      console.log('User updated successfully:', data);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="flex items-center mb-4">
        <img src={profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${email}`} alt="avatar" className="w-24 h-24 rounded-full mr-4" />
        <input type="file" onChange={(e) => {
          if (e.target.files) {
            // In a real app, you'd upload this to storage and get a URL
            setProfilePicture(URL.createObjectURL(e.target.files[0]));
          }
        }} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
        />
      </div>
      <button
        onClick={handleUpdate}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl"
      >
        Update Profile
      </button>
    </div>
  );
};
