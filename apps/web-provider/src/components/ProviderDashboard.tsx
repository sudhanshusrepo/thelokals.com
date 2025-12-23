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

import { AvailabilitySettings } from './AvailabilitySettings';
import { PaymentPage } from './PaymentPage';
import { NotificationsPage } from './NotificationsPage';

type Tab = 'Requests' | 'Bookings' | 'Profile' | 'Availability' | 'Payments' | 'Notifications';
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

  // Helper to map DB snake_case to Domain camelCase
  const mapToBookingRequest = (data: any): BookingRequest => ({
    requestId: data.id,
    bookingId: data.booking_id,
    providerId: data.provider_id,
    status: data.status,
  });

  const fetchProviderData = async () => {
    if (!workerId) return;
    try {
      const data = await bookingService.getProviderBookings(workerId);
      setBookings(data);

      const earnings = data
        .filter(b => b.status === 'COMPLETED' && b.payment_status === 'PAID')
        .reduce((acc, b) => acc + (b.final_cost || b.estimated_cost || 0), 0);
      setTotalEarnings(earnings);

      // Fetch pending requests
      const { data: requests } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('provider_id', workerId)
        .eq('status', 'PENDING');

      if (requests) {
        const mappedRequests = requests.map(mapToBookingRequest);
        setLiveRequests(mappedRequests);
      }

    } catch (error) {
      console.error("Error fetching provider data", error);
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
        if (payload.eventType === 'INSERT') {
          const newRequest = mapToBookingRequest(payload.new);
          setLiveRequests(prev => [...prev, newRequest]);
        }
      });

      return () => {
        supabase.removeChannel(bookingsChannel);
        providerLiveBookingService.unsubscribeFromChannel(liveRequestsChannel);
      };
    }
  }, [workerId, fetchProviderData]);

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
        <h2 className="text-2xl font-bold text-[#0A2540]">Provider Dashboard</h2>
        <EarningsCard earnings={totalEarnings} />
      </div>

      <LocationTracker />

      <div className="border-b border-[#E2E8F0] overflow-x-auto scrollbar-hide">
        <nav className="-mb-px flex space-x-6 min-w-max" aria-label="Tabs">
          <TabButton title="Requests" count={liveRequests.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Bookings" count={bookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Availability" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Payments" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Notifications" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Profile" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'Requests' && <LiveRequestList requests={liveRequests} onAccept={handleAcceptRequest} />}

        {activeTab === 'Bookings' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(['Active', 'Upcoming', 'Pending', 'Past'] as BookingFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setBookingFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${bookingFilter === filter
                    ? 'bg-[#0A2540] text-white shadow-md'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F5F7FB]'
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

        {activeTab === 'Availability' && <AvailabilitySettings />}
        {activeTab === 'Payments' && <PaymentPage />}
        {activeTab === 'Notifications' && <NotificationsPage />}

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
      <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
        <div className="w-20 h-20 bg-[#F5F7FB] rounded-full flex items-center justify-center shadow-inner mb-6">
          <span className="text-4xl opacity-50">⚡️</span>
        </div>
        <h3 className="text-xl font-bold text-[#0A2540] mb-2">No active requests nearby</h3>
        <p className="text-[#64748B] max-w-xs mx-auto">
          Stay online! We&apos;ll notify you via push notification as soon as a customer requests a service in area.
        </p>
        <div className="mt-6 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-[#12B3A6] animate-bounce"></div>
          <div className="h-2 w-2 rounded-full bg-[#12B3A6] animate-bounce delay-100"></div>
          <div className="h-2 w-2 rounded-full bg-[#12B3A6] animate-bounce delay-200"></div>
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
  <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-lg animate-pulse hover:shadow-xl transition-shadow">
    <h3 className="font-bold text-[#0A2540]">New Live Booking!</h3>
    <p className="text-sm text-[#64748B]">A new job is available nearby.</p>
    <button onClick={() => onAccept(request.bookingId)} className="mt-4 w-full text-sm font-bold text-white bg-[#12B3A6] px-4 py-2.5 rounded-xl hover:bg-[#0e9085] transition-colors shadow-md">
      Accept Request
    </button>
  </div>
);

const EarningsCard: React.FC<{ earnings: number }> = ({ earnings }) => (
  <div className="bg-gradient-to-r from-[#12B3A6] to-[#0A2540] rounded-2xl p-4 text-white w-full sm:w-auto shadow-lg">
    <div className="text-sm font-medium opacity-90">Total Earnings</div>
    <div className="text-3xl font-bold tracking-tight">
      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(earnings)}
    </div>
  </div>
);

const TabButton: React.FC<{ title: Tab, count: number, activeTab: Tab, setActiveTab: (tab: Tab) => void }> = ({ title, count, activeTab, setActiveTab }) => {
  const isActive = activeTab === title;
  return (
    <button
      onClick={() => setActiveTab(title)}
      className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-all focus:outline-none ${isActive ? 'border-[#12B3A6] text-[#0A2540]' : 'border-transparent text-[#64748B] hover:text-[#0A2540] hover:border-[#E2E8F0]'}`}>
      {title} <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-[#E0F2F1] text-[#12B3A6]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>{count}</span>
    </button>
  );
}

const BookingList: React.FC<{ bookings: Booking[], onUpdateStatus?: (bookingId: string, status: BookingStatus) => void }> = ({ bookings, onUpdateStatus }) => {
  if (bookings.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
        <div className="w-20 h-20 bg-[#F5F7FB] rounded-full flex items-center justify-center shadow-inner mb-6">
          <span className="text-4xl opacity-50">🗓️</span>
        </div>
        <h3 className="text-xl font-bold text-[#0A2540] mb-2">No bookings found</h3>
        <p className="text-[#64748B] max-w-xs mx-auto">
          Bookings in this category will appear here. Check the &apos;Requests&apos; tab for new opportunities.
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
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" data-testid="provider-booking-card">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-[#0A2540]">{booking.user?.name || 'New Client'}</h3>
            <p className="text-xs text-[#64748B]">{new Date(booking.created_at).toLocaleString()}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold bg-[#F5F7FB] text-[#0A2540]`}>
            {status?.replace('_', ' ')}
          </div>
        </div>
        <div className="bg-[#F5F7FB] rounded-xl p-3 text-sm text-[#64748B] mb-4">
          <p>&quot;{booking.notes}&quot;</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        {status === 'PENDING' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')} className="text-sm font-bold text-white bg-[#12B3A6] px-4 py-2 rounded-xl hover:bg-[#0e9085] transition-colors shadow-sm">
            Accept
          </button>
        )}
        {status === 'CONFIRMED' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'EN_ROUTE')} className="text-sm font-bold text-white bg-[#3B82F6] px-4 py-2 rounded-xl hover:bg-[#2563EB] transition-colors shadow-sm">
            On My Way
          </button>
        )}
        {status === 'EN_ROUTE' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'IN_PROGRESS')} className="text-sm font-bold text-white bg-[#0A2540] px-4 py-2 rounded-xl hover:bg-[#06192E] transition-colors shadow-sm">
            Arrived / Start
          </button>
        )}
        {status === 'IN_PROGRESS' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'COMPLETED')} className="text-sm font-bold text-white bg-[#3B82F6] px-4 py-2 rounded-xl hover:bg-[#2563EB] transition-colors shadow-sm">
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
