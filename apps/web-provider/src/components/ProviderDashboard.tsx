import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { liveBookingService as providerLiveBookingService } from '../services/liveBookingService';
import { liveBookingService as coreLiveBookingService } from '@thelocals/core/services/liveBookingService';
import { Booking, BookingStatus, BookingRequest } from '@thelocals/core';
import { supabase } from '@thelocals/core/services/supabase';

import { ProfileTab } from './ProfileTab';
import { ProviderProfile } from '../types';
import { LocationTracker } from './LocationTracker';

type Tab = 'Requests' | 'Bookings' | 'Profile';
type BookingFilter = 'Upcoming' | 'Active' | 'Past' | 'Pending';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveRequests, setLiveRequests] = useState<BookingRequest[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Requests');
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('Active');
  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  const workerId = user?.id;

  const fetchProviderData = async () => {
    if (!workerId) return;
    try {
      const data = await bookingService.getProviderBookings(workerId);
      setBookings(data);

      const earnings = data
        .filter(b => b.status === 'COMPLETED' && b.payment_status === 'PAID')
        .reduce((acc, b) => acc + (b.final_cost || b.estimated_cost || 0), 0);
      setTotalEarnings(earnings);

    } catch (error) {
      // Silent fail or toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workerId) {
      fetchProviderData();

      const bookingsChannel = supabase
        .channel(`provider-bookings-${workerId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `worker_id=eq.${workerId}` },
          () => fetchProviderData()
        )
        .subscribe();

      const liveRequestsChannel = providerLiveBookingService.subscribeToLiveBookingRequests(workerId, (payload) => {
        const newRequest = payload.new as BookingRequest;
        setLiveRequests(prev => [...prev, newRequest]);
      });

      return () => {
        supabase.removeChannel(bookingsChannel);
        providerLiveBookingService.unsubscribeFromChannel(liveRequestsChannel);
      };
    }
  }, [workerId]);

  const handleAcceptRequest = async (bookingId: string) => {
    if (!workerId) return;
    try {
      await coreLiveBookingService.acceptBooking(bookingId, workerId);
      setLiveRequests(prev => prev.filter(r => r.bookingId !== bookingId));
      // The bookings subscription will automatically update the other tabs
    } catch (error) {
      console.error("Failed to accept booking:", error);
    }
  }

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  const pendingBookings = bookings.filter(b => b.status?.toUpperCase() === 'PENDING');
  const upcomingBookings = bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED');
  const activeBookings = bookings.filter(b => b.status?.toUpperCase() === 'IN_PROGRESS');
  const pastBookings = bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED' || b.status?.toUpperCase() === 'CANCELLED');

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Provider Dashboard</h2>
        <EarningsCard earnings={totalEarnings} />
      </div>

      <LocationTracker />

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <TabButton title="Requests" count={liveRequests.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Bookings" count={bookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Profile" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'Requests' && <LiveRequestList requests={liveRequests} onAccept={handleAcceptRequest} />}

        {activeTab === 'Bookings' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['Active', 'Upcoming', 'Pending', 'Past'] as BookingFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setBookingFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${bookingFilter === filter
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {bookingFilter === 'Active' && <BookingList bookings={activeBookings} onUpdateStatus={handleUpdateStatus} />}
            {bookingFilter === 'Upcoming' && <BookingList bookings={upcomingBookings} onUpdateStatus={handleUpdateStatus} />}
            {bookingFilter === 'Pending' && <BookingList bookings={pendingBookings} onUpdateStatus={handleUpdateStatus} />}
            {bookingFilter === 'Past' && <BookingList bookings={pastBookings} />}
          </div>
        )}

        {activeTab === 'Profile' && profile && (
          <ProfileTab
            profile={profile}
            onUpdate={(updates) => {
              setProfile(prev => prev ? ({ ...prev, ...updates }) : null);
              // Here we would call the backend to update the profile
            }}
          />
        )}
      </div>
    </div>
  );
};

const LiveRequestList: React.FC<{ requests: BookingRequest[], onAccept: (bookingId: string) => void }> = ({ requests, onAccept }) => {
  if (requests.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <span className="text-4xl opacity-50">⚡️</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No active requests nearby</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Stay online! We'll notify you via push notification as soon as a customer requests a service in your area.
        </p>
        <div className="mt-6 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></div>
          <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce delay-100"></div>
          <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map(request => <LiveRequestCard key={request.requestId} request={request} onAccept={onAccept} />)}
    </div>
  );
};

const LiveRequestCard: React.FC<{ request: BookingRequest, onAccept: (bookingId: string) => void }> = ({ request, onAccept }) => (
  <div className="bg-white rounded-2xl p-5 border shadow-lg animate-pulse">
    <h3 className="font-bold">New Live Booking!</h3>
    <p className="text-sm text-gray-600">A new job is available nearby.</p>
    <button onClick={() => onAccept(request.bookingId)} className="mt-4 w-full text-sm font-bold text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
      Accept
    </button>
  </div>
);

const EarningsCard: React.FC<{ earnings: number }> = ({ earnings }) => (
  <div className="bg-green-600 rounded-xl p-4 text-white w-full sm:w-auto shadow-lg">
    <div className="text-sm font-medium text-green-100">Total Earnings (Completed & Paid)</div>
    <div className="text-3xl font-bold">
      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(earnings)}
    </div>
  </div>
);

const TabButton: React.FC<{ title: Tab, count: number, activeTab: Tab, setActiveTab: (tab: Tab) => void }> = ({ title, count, activeTab, setActiveTab }) => {
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
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <span className="text-4xl opacity-50">🗓️</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Bookings in this category will appear here. Check the 'Requests' tab for new opportunities.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map(booking => <ProviderBookingCard key={booking.id} booking={booking} onUpdateStatus={onUpdateStatus} />)}
    </div>
  );
};

const ProviderBookingCard: React.FC<{ booking: Booking, onUpdateStatus?: (bookingId: string, status: BookingStatus) => void }> = ({ booking, onUpdateStatus }) => {
  const status = booking.status?.toUpperCase();
  const paymentStatus = booking.payment_status?.toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between" data-testid="provider-booking-card">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-800">{booking.user?.name || 'New Client'}</h3>
            <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleString()}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800`}>
            {status?.replace('_', ' ')}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 mb-4">
          <p>"{booking.notes}"</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        {status === 'PENDING' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')} className="text-sm font-bold text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Accept
          </button>
        )}
        {status === 'CONFIRMED' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'EN_ROUTE')} className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            On My Way
          </button>
        )}
        {status === 'EN_ROUTE' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'IN_PROGRESS')} className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Arrived / Start
          </button>
        )}
        {status === 'IN_PROGRESS' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'COMPLETED')} className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Complete Job
          </button>
        )}
        {status === 'COMPLETED' && (
          <div className={`text-sm font-bold p-2 rounded-lg ${paymentStatus === 'PAID' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
            {paymentStatus === 'PAID' ? 'Payment Received' : 'Awaiting Payment'}
          </div>
        )}
      </div>
    </div >
  )
}
