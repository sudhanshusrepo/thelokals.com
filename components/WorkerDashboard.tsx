import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, WorkerProfile, WorkerStatus, WorkerCategory } from '../types';
import { bookingService } from '../services/bookingService';
import { workerService } from '../services/workerService';
import { supabase } from '../services/supabase';

export const WorkerDashboard: React.FC = () => {
  // For demo purposes, we assume the logged-in user is "Mario Rossi" (ID: 1)
  // In a real app, we would get this ID from the AuthContext -> User Profile relation
  const DEMO_WORKER_ID = '1'; 
  
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<WorkerProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();

    // Subscribe to realtime booking changes
    const channel = supabase
      .channel('worker-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `worker_id=eq.${DEMO_WORKER_ID}` },
        () => { loadBookings(); } // Reload bookings on any change
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    await Promise.all([loadProfile(), loadBookings()]);
    setLoading(false);
  };

  const loadProfile = async () => {
    const worker = await workerService.getWorkerById(DEMO_WORKER_ID);
    if (worker) setProfile(worker);
  };

  const loadBookings = async () => {
    try {
        const data = await bookingService.getWorkerBookings(DEMO_WORKER_ID);
        setBookings(data);
    } catch (e) {
        console.error("Failed to load bookings", e);
    }
  };

  const handleStatusChange = async (status: WorkerStatus) => {
    if (!profile) return;
    // Optimistic update
    setProfile({ ...profile, status });
    await workerService.updateWorkerStatus(profile.id, status);
  };

  const handleBookingAction = async (bookingId: string, newStatus: BookingStatus) => {
    // Optimistic update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    try {
        await bookingService.updateBookingStatus(bookingId, newStatus);
    } catch (error) {
        console.error("Failed to update booking", error);
        loadBookings(); // Revert on error
    }
  };

  const handleEditClick = () => {
    if (!profile) return;
    setEditForm({
        name: profile.name,
        category: profile.category,
        price: profile.price,
        priceUnit: profile.priceUnit,
        description: profile.description
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
        await workerService.updateWorkerProfile(profile.id, editForm);
        setProfile({ ...profile, ...editForm } as WorkerProfile);
        setIsEditing(false);
    } catch (error) {
        console.error("Error saving profile", error);
        alert("Failed to save changes.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading professional dashboard...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Worker profile not found.</div>;

  const requests = bookings.filter(b => b.status === 'pending');
  const active = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
  const history = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const getTabCount = (tab: string) => {
      if (tab === 'requests') return requests.length;
      if (tab === 'active') return active.length;
      return history.length;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 animate-fade-in">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-gray-200 dark:shadow-gray-900 border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
             
             <div className="relative z-10">
                {/* Top Row: Profile & Status */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative flex-shrink-0">
                            <img src={profile.imageUrl} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-md bg-gray-200" />
                            <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full border-2 border-white dark:border-gray-700 shadow-sm font-bold">
                                PRO
                            </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        value={editForm.name || ''}
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                        className="block w-full text-xl font-bold border-b border-indigo-300 focus:border-indigo-600 focus:outline-none bg-transparent dark:text-white px-1 py-0.5"
                                        placeholder="Your Name"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={editForm.category || ''}
                                            onChange={e => setEditForm({...editForm, category: e.target.value as WorkerCategory})}
                                            className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {Object.values(WorkerCategory).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-bold">$</span>
                                        <input 
                                            type="number"
                                            value={editForm.price || ''}
                                            onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                            className="w-20 border-b border-gray-300 dark:border-gray-600 focus:border-indigo-600 outline-none bg-transparent dark:text-white px-1 font-semibold"
                                        />
                                        <select 
                                            value={editForm.priceUnit || 'visit'}
                                            onChange={e => setEditForm({...editForm, priceUnit: e.target.value as any})}
                                            className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none outline-none"
                                        >
                                            <option value="visit">/visit</option>
                                            <option value="hr">/hr</option>
                                            <option value="service">/service</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{profile.name}</h1>
                                        <button 
                                            onClick={handleEditClick}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            title="Edit Profile"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">{profile.category} • {profile.rating} ★</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            ${profile.price}/{profile.priceUnit}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 self-end md:self-auto">
                        <div className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded-xl border border-gray-200 dark:border-gray-600 flex gap-1">
                            {(['AVAILABLE', 'BUSY', 'OFFLINE'] as WorkerStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        profile.status === status 
                                        ? (status === 'AVAILABLE' ? 'bg-green-500 text-white shadow-md' : 
                                        status === 'BUSY' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-600 text-white shadow-md')
                                        : 'text-gray-500 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Description Section */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    {isEditing ? (
                         <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-2">About Me</label>
                             <textarea 
                                value={editForm.description || ''}
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="Describe your services and experience..."
                             />
                             <div className="flex justify-end gap-3 mt-4">
                                 <button 
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    disabled={saving}
                                 >
                                     Cancel
                                 </button>
                                 <button 
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                                 >
                                     {saving ? 'Saving...' : 'Save Changes'}
                                 </button>
                             </div>
                         </div>
                    ) : (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">About Me</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                                {profile.description || "No description provided."}
                            </p>
                        </div>
                    )}
                </div>
             </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Earnings Today</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$120.00</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Jobs Done</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{history.length}</p>
             </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Rating</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{profile.rating}</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Views</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">84</p>
             </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
            {['requests', 'active', 'history'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {getTabCount(tab)}
                    </span>
                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></div>}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
            {activeTab === 'requests' && (
                requests.length === 0 ? <EmptyState message="No new booking requests." /> :
                requests.map(booking => (
                    <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        actions={
                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button 
                                    onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Decline
                                </button>
                                <button 
                                    onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-[0.98]"
                                >
                                    Accept Request
                                </button>
                            </div>
                        }
                    />
                ))
            )}

            {activeTab === 'active' && (
                 active.length === 0 ? <EmptyState message="No active jobs right now." /> :
                 active.map(booking => (
                    <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        actions={
                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                {booking.status === 'confirmed' && (
                                    <button 
                                        onClick={() => handleBookingAction(booking.id, 'in_progress')}
                                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                                    >
                                        Start Job
                                    </button>
                                )}
                                {booking.status === 'in_progress' && (
                                    <button 
                                        onClick={() => handleBookingAction(booking.id, 'completed')}
                                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-all"
                                    >
                                        Complete Job
                                    </button>
                                )}
                            </div>
                        }
                    />
                ))
            )}

            {activeTab === 'history' && (
                 history.length === 0 ? <EmptyState message="No past jobs found." /> :
                 history.map(booking => (
                    <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        isHistory
                    />
                ))
            )}
        </div>
    </div>
  );
};

const BookingCard: React.FC<{ booking: Booking, actions?: React.ReactNode, isHistory?: boolean }> = ({ booking, actions, isHistory }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-shadow ${isHistory ? 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-none'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isHistory ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
                        👤
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-lg ${isHistory ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>Customer Request</h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-300 font-medium">
                                {new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">${booking.total_price}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400">1.2 km away</span>
                        </div>
                        <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-gray-700">
                            "{booking.note}"
                        </div>
                    </div>
                </div>
                
                {actions}
                
                {isHistory && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'}`}>
                        {booking.status.toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
        <div className="text-4xl mb-3 opacity-50">📂</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
    </div>
);