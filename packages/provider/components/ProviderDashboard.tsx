import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { Booking, BookingStatus } from '../../core/types';
import { supabase } from '../../core/services/supabase';

type Tab = 'Upcoming' | 'Active' | 'Past' | 'Pending';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth(); // Provider's user object
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Pending');

  // This assumes you have a mapping from the auth user to a worker profile
  // This is a placeholder and needs to be implemented based on your data structure
  const workerId = user?.id; 

  const fetchProviderData = async () => {
    if (!workerId) return;
    try {
      const data = await bookingService.getProviderBookings(workerId);
      setBookings(data);

      const earnings = data
        .filter(b => b.status === 'completed' && b.payment_status === 'paid')
        .reduce((acc, b) => acc + (b.total_price || 0), 0);
      setTotalEarnings(earnings);

    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();

    const channel = supabase
      .channel(`provider-bookings-${workerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `worker_id=eq.${workerId}` }, 
        () => fetchProviderData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId]);

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
      try {
          await bookingService.updateBookingStatus(bookingId, status);
          // The realtime subscription will trigger a refetch
      } catch (error) {
          console.error("Failed to update status:", error);
      }
  }
  
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const activeBookings = bookings.filter(b => b.status === 'in_progress');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold">Provider Dashboard</h2>
            <EarningsCard earnings={totalEarnings} />
        </div>
      
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                <TabButton title="Pending" count={pendingBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Upcoming" count={upcomingBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Active" count={activeBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Past" count={pastBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
        </div>

        <div className="mt-6">
            {activeTab === 'Pending' && <BookingList bookings={pendingBookings} onUpdateStatus={handleUpdateStatus} />}
            {activeTab === 'Upcoming' && <BookingList bookings={upcomingBookings} onUpdateStatus={handleUpdateStatus} />}
            {activeTab === 'Active' && <BookingList bookings={activeBookings} onUpdateStatus={handleUpdateStatus} />}
            {activeTab === 'Past' && <BookingList bookings={pastBookings} />}
        </div>
    </div>
  );
};

// Sub-components

const EarningsCard: React.FC<{ earnings: number }> = ({ earnings }) => (
    <div className="bg-green-600 rounded-xl p-4 text-white w-full sm:w-auto shadow-lg">
        <div className="text-sm font-medium text-green-100">Total Earnings (Completed & Paid)</div>
        <div className="text-3xl font-bold">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(earnings)}
        </div>
    </div>
);

const TabButton: React.FC<{title: Tab, count: number, activeTab: Tab, setActiveTab: (tab: Tab) => void}> = ({ title, count, activeTab, setActiveTab }) => {
    const isActive = activeTab === title;
    return (
        <button
          onClick={() => setActiveTab(title)}
          className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          {title} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'}`}>{count}</span>
        </button>
    );
}

const BookingList: React.FC<{ bookings: Booking[], onUpdateStatus?: (bookingId: string, status: BookingStatus) => void }> = ({ bookings, onUpdateStatus }) => {
    if (bookings.length === 0) {
        return (
          <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
              <div className="text-5xl mb-4">🗓️</div>
              <h3 className="text-lg font-semibold">No jobs in this category</h3>
          </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(booking => <ProviderBookingCard key={booking.id} booking={booking} onUpdateStatus={onUpdateStatus} />)}
        </div>
    );
};

const ProviderBookingCard: React.FC<{booking: Booking, onUpdateStatus?: (bookingId: string, status: BookingStatus) => void}> = ({ booking, onUpdateStatus }) => {
    
    return (
        <div className="bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-gray-800">{booking.user?.name || 'New Client'}</h3>
                        <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleString()}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 mb-4">
                    <p>"{booking.note}"</p>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
                 {booking.status === 'pending' && onUpdateStatus && (
                    <button onClick={() => onUpdateStatus(booking.id, 'confirmed')} className="text-sm font-bold text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Accept
                    </button>
                )}
                {booking.status === 'confirmed' && onUpdateStatus && (
                    <button onClick={() => onUpdateStatus(booking.id, 'in_progress')} className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Start Job
                    </button>
                )}
                {booking.status === 'in_progress' && onUpdateStatus && (
                    <button onClick={() => onUpdateStatus(booking.id, 'completed')} className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Complete Job
                    </button>
                )}
                 {booking.status === 'completed' && (
                    <div className={`text-sm font-bold p-2 rounded-lg ${booking.payment_status === 'paid' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                        {booking.payment_status === 'paid' ? 'Payment Received' : 'Awaiting Payment'}
                    </div>
                )}
            </div>
        </div>
    )
}
