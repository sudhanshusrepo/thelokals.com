import React, { useState } from 'react';
import { ProviderProfile, WorkerCategory } from '../types';

interface ProfileTabProps {
    profile: ProviderProfile;
    onUpdate: (updates: Partial<ProviderProfile>) => void;
    onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onUpdate, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(profile);

    const handleSave = () => {
        onUpdate(editForm);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Professional Profile</h3>
                    <div className="flex gap-3">
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 rounded-lg font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                                Sign Out
                            </button>
                        )}
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isEditing
                                ? 'bg-primary text-white hover:bg-blue-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            ) : (
                                <p className="text-lg font-medium text-slate-900">{profile.full_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Category</label>
                            <p className="text-lg font-medium text-slate-900">{profile.category || 'Not Selected'}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Experience</label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={editForm.experience_years || 0}
                                        onChange={e => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) })}
                                        className="w-20 p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                    <span className="text-slate-500">Years</span>
                                </div>
                            ) : (
                                <p className="text-lg font-medium text-slate-900">{profile.experience_years || 0} Years</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Operating City</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.city || ''}
                                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            ) : (
                                <p className="text-lg font-medium text-slate-900">{profile.city || 'Not Set'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Locality / Hub</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.locality || ''}
                                    onChange={e => setEditForm({ ...editForm, locality: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            ) : (
                                <p className="text-lg font-medium text-slate-900">{profile.locality || 'Not Set'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Radius (Meters)</label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1000"
                                        step="500"
                                        value={editForm.service_radius || 5000}
                                        onChange={e => setEditForm({ ...editForm, service_radius: parseInt(e.target.value) })}
                                        className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                    <span className="text-slate-500 text-sm">meters</span>
                                </div>
                            ) : (
                                <p className="text-lg font-medium text-slate-900">
                                    {profile.service_radius ? `${(profile.service_radius / 1000).toFixed(1)} km` : 'Default (5 km)'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Performance & Feedback</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <div className="text-3xl font-bold text-primary mb-1">4.8</div>
                        <div className="text-sm text-slate-500 font-medium">Average Rating</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <div className="text-3xl font-bold text-primary mb-1">124</div>
                        <div className="text-sm text-slate-500 font-medium">Jobs Completed</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <div className="text-3xl font-bold text-primary mb-1">98%</div>
                        <div className="text-sm text-slate-500 font-medium">Response Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
