import React, { useEffect, useState, useCallback } from 'react';
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
import { PaymentsTab } from './PaymentsTab';
import { NotificationsPage } from './NotificationsPage';

import { ActiveJobWorkbench } from './ActiveJobWorkbench';

export type InboxTab = 'New' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled' | 'Availability' | 'Payments' | 'Notifications' | 'Profile';

export const ProviderDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveRequests, setLiveRequests] = useState<BookingRequest[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InboxTab>('New');
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  const workerId = user?.id;

  // Helper to map DB snake_case to Domain camelCase
  const mapToBookingRequest = (data: any): BookingRequest => ({
    requestId: data.id,
    bookingId: data.booking_id,
    providerId: data.provider_id,
    status: data.status,
  });

  const fetchProviderData = useCallback(async () => {
    if (!workerId) return;
    try {
      const data = await bookingService.getProviderBookings(workerId);
      setBookings(data);

      // Auto-enter workbench for active jobs if not already selected
      const activeJob = data.find(b => b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE');
      if (activeJob && !activeBookingId) {
        // Optional: Auto-select active job? Let's leave it manual or 'In Progress' tab for now to avoid annoyance.
        // Or strictly separate "Workbench" mode. 
        // Let's implement manual entry for now.
      }

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
  }, [workerId]); // removed activeBookingId dependency to avoid loops

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
  }, [workerId]);

  const handleAcceptRequest = async (bookingId: string) => {
    if (!workerId) return;
    try {
      // Optimistic update
      setLiveRequests(prev => prev.filter(r => r.bookingId !== bookingId));

      await coreLiveBookingService.acceptBooking(bookingId, workerId);
      // The bookings subscription will automatically update the lists
    } catch (error) {
      console.error("Failed to accept booking:", error);
      fetchProviderData(); // Revert on error
    }
  }

  const handleRejectRequest = async (bookingId: string) => {
    if (!workerId) return;
    try {
      // Optimistic update
      setLiveRequests(prev => prev.filter(r => r.bookingId !== bookingId));

      await coreLiveBookingService.rejectBooking(bookingId, workerId);
    } catch (error) {
      console.error("Failed to reject booking:", error);
      fetchProviderData(); // Revert on error
    }
  }

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      // Optimistic update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      if (status === 'COMPLETED') {
        setActiveBookingId(null); // Exit workbench
      }

      await bookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error("Failed to update status:", error);
      fetchProviderData(); // Revert on error
    }
  }

  // --- Realtime Notifications Integration ---
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const { realtimeService, ProviderNotification } = require('../services/realtime'); // Dynamic import to avoid cycles or ensure freshness
  const { toast } = require('react-hot-toast');

  useEffect(() => {
    if (!workerId) return;

    const fetchUnreadCount = async () => {
      try {
        const notifs = await realtimeService.getNotifications(workerId);
        setUnreadNotifications(notifs.filter((n: any) => !n.read).length);
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    }

    fetchUnreadCount();

    const unsubscribe = realtimeService.subscribeToNotifications(
      workerId,
      (newNotif: any) => {
        setUnreadNotifications(prev => prev + 1);

        // Custom Toast with Action
        toast((t: any) => (
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              toast.dismiss(t.id);
              if (newNotif.data?.booking_id) {
                // Determine where to go based on status/type
                const bookingId = newNotif.data.booking_id;
                const booking = bookings.find(b => b.id === bookingId);

                // If it's a new request (might not be in bookings yet if optimistic, but usually is)
                if (newNotif.type === 'booking_request') {
                  setActiveTab('New');
                } else if (booking) {
                  // Navigate to appropriate tab
                  if (booking.status === 'CONFIRMED') setActiveTab('Accepted');
                  if (booking.status === 'IN_PROGRESS') {
                    setActiveTab('In Progress');
                    setActiveBookingId(bookingId); // Open workbench
                  }
                  if (booking.status === 'COMPLETED') setActiveTab('Completed');
                }
              }
            }}
          >
            <span className="text-xl">🔔</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{newNotif.title}</p>
              <p className="text-xs text-gray-500">{newNotif.message}</p>
            </div>
            {newNotif.data?.booking_id && (
              <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                View
              </button>
            )}
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid #f1f5f9'
          }
        });
      },
      (updatedNotif: any) => {
        // Re-fetch to be safe on updates (like read status changes from other devices)
        fetchUnreadCount();
      }
    );

    return () => {
      unsubscribe();
    }
  }, [workerId]);

  // Filter Bookings for Tabs
  const pendingDirectBookings = bookings.filter(b => b.status?.toUpperCase() === 'PENDING');
  const acceptedBookings = bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED');
  const inProgressBookings = bookings.filter(b => b.status?.toUpperCase() === 'IN_PROGRESS' || b.status?.toUpperCase() === 'EN_ROUTE');
  const completedBookings = bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED');
  const cancelledBookings = bookings.filter(b => b.status?.toUpperCase() === 'CANCELLED');

  if (loading) return <div className="p-8 text-center text-muted animate-pulse">Loading dashboard...</div>;

  // Active Job Workbench View
  const activeJob = bookings.find(b => b.id === activeBookingId);
  if (activeBookingId && activeJob) {
    return (
      <ActiveJobWorkbench
        booking={activeJob}
        onUpdateStatus={handleUpdateStatus}
        onClose={() => setActiveBookingId(null)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">Provider Inbox</h2>
        <EarningsCard earnings={totalEarnings} />
      </div>

      <LocationTracker onTrackingChange={setIsLocationActive} />

      <div className="overflow-x-auto scrollbar-hide py-2">
        <nav className="flex space-x-2 min-w-max p-1" aria-label="Tabs">
          <TabButton title="New" count={liveRequests.length + pendingDirectBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Accepted" count={acceptedBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="In Progress" count={inProgressBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Completed" count={completedBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Cancelled" count={cancelledBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />



          <TabButton title="Availability" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Payments" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Notifications" count={unreadNotifications} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton title="Profile" count={0} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'New' && (
          <div className="space-y-8">
            {liveRequests.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Live Requests</h3>
                <LiveRequestList requests={liveRequests} onAccept={handleAcceptRequest} onReject={handleRejectRequest} />
              </section>
            )}
            {pendingDirectBookings.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Direct Bookings</h3>
                <BookingList bookings={pendingDirectBookings} onUpdateStatus={handleUpdateStatus} emptyMessage="No direct bookings pending." />
              </section>
            )}
            {liveRequests.length === 0 && pendingDirectBookings.length === 0 && (
              <EmptyState
                icon="⚡️"
                title="All caught up!"
                message="You have no new requests. Stay online to receive live bookings."
              />
            )}
          </div>
        )}

        {activeTab === 'Accepted' && <BookingList bookings={acceptedBookings} onUpdateStatus={handleUpdateStatus} emptyMessage="No accepted jobs. Go to 'New' to accept one!" onSelect={setActiveBookingId} />}
        {activeTab === 'In Progress' && <BookingList bookings={inProgressBookings} onUpdateStatus={handleUpdateStatus} emptyMessage="No jobs in progress." onSelect={setActiveBookingId} />}
        {activeTab === 'Completed' && <BookingList bookings={completedBookings} emptyMessage="No completed jobs yet." />}
        {activeTab === 'Cancelled' && <BookingList bookings={cancelledBookings} emptyMessage="No cancelled jobs." />}
        {activeTab === 'Payments' && <PaymentsTab bookings={bookings} />}

        {activeTab === 'Availability' && <AvailabilitySettings isLocationActive={isLocationActive} />}
        {activeTab === 'Notifications' && <NotificationsPage />}

        {activeTab === 'Profile' && profile && (
          <ProfileTab
            profile={profile}
            onUpdate={async (updates) => {
              // Optimistic update
              setProfile(prev => prev ? ({ ...prev, ...updates }) : null);

              if (workerId) {
                try {
                  const { error } = await supabase
                    .from('providers')
                    .update(updates)
                    .eq('id', workerId);

                  if (error) {
                    console.error("Failed to update profile", error);
                    // Revert or show toast? For now, console error.
                    // Ideally fetchProviderData() to revert
                  } else {
                    // Success - maybe show toast?
                  }
                } catch (err) {
                  console.error("Error updating profile", err);
                }
              }
            }}
            onLogout={() => {
              signOut();
            }}
          />
        )}
      </div>
    </div>
  );
};

const LiveRequestList: React.FC<{ requests: BookingRequest[], onAccept: (bookingId: string) => void, onReject: (bookingId: string) => void }> = ({ requests, onAccept, onReject }) => {
  if (requests.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map(request => <LiveRequestCard key={request.requestId} request={request} onAccept={onAccept} onReject={onReject} />)}
    </div>
  );
};

const LiveRequestCard: React.FC<{ request: BookingRequest, onAccept: (bookingId: string) => void, onReject: (bookingId: string) => void }> = ({ request, onAccept, onReject }) => (
  <div className="bg-white rounded-2xl p-5 border border-border shadow-lg animate-pulse hover:shadow-xl transition-shadow flex flex-col justify-between">
    <div>
      <h3 className="font-bold text-primary">New Live Booking!</h3>
      <p className="text-sm text-muted">A new job is available nearby.</p>
    </div>
    <div className="mt-4 flex gap-2">
      <button onClick={() => onReject(request.bookingId)} className="flex-1 text-sm font-bold text-muted bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
        Decline
      </button>
      <button onClick={() => onAccept(request.bookingId)} className="flex-1 text-sm font-bold text-white bg-accent px-4 py-2.5 rounded-xl hover:opacity-90 transition-colors shadow-md">
        Accept
      </button>
    </div>
  </div>
);

const EarningsCard: React.FC<{ earnings: number }> = ({ earnings }) => (
  <div className="bg-gradient-to-r from-accent to-primary rounded-2xl p-4 text-white w-full sm:w-auto shadow-lg">
    <div className="text-sm font-medium opacity-90">Total Earnings</div>
    <div className="text-3xl font-bold tracking-tight">
      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(earnings)}
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: string; title: string; message: string }> = ({ icon, title, message }) => (
  <div className="bg-white border-2 border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-inner mb-6">
      <span className="text-4xl opacity-50">{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
    <p className="text-muted max-w-xs mx-auto">
      {message}
    </p>
  </div>
);

const TabButton: React.FC<{ title: string, count: number, activeTab: string, setActiveTab: (tab: any) => void }> = ({ title, count, activeTab, setActiveTab }) => {
  const isActive = activeTab === title;
  return (
    <button
      onClick={() => setActiveTab(title)}
      className={`whitespace-nowrap py-2 px-4 rounded-full font-medium text-sm transition-all duration-200 focus:outline-none flex items-center gap-2
        ${isActive
          ? 'bg-primary text-white shadow-md'
          : 'bg-transparent text-muted hover:bg-gray-100 hover:text-primary'
        }`}
    >
      {title}
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-muted'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

const BookingList: React.FC<{ bookings: Booking[], onUpdateStatus?: (bookingId: string, status: BookingStatus) => void, emptyMessage?: string, onSelect?: (bookingId: string) => void }> = ({ bookings, onUpdateStatus, emptyMessage = "No bookings found.", onSelect }) => {
  if (bookings.length === 0) {
    return <EmptyState icon="🗓️" title="No bookings found" message={emptyMessage} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map(booking => <ProviderBookingCard key={booking.id} booking={booking} onUpdateStatus={onUpdateStatus} onSelect={onSelect} />)}
    </div>
  );
};

const ProviderBookingCard: React.FC<{ booking: Booking, onUpdateStatus?: (bookingId: string, status: BookingStatus) => void, onSelect?: (bookingId: string) => void }> = ({ booking, onUpdateStatus, onSelect }) => {
  const status = booking.status?.toUpperCase();
  const paymentStatus = booking.payment_status?.toUpperCase();

  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'CONFIRMED': return 'bg-status-accepted text-white';
      case 'EN_ROUTE': return 'bg-status-inprogress text-white';
      case 'IN_PROGRESS': return 'bg-status-inprogress text-white';
      case 'COMPLETED': return 'bg-status-completed text-white';
      case 'CANCELLED': return 'bg-status-cancelled text-white';
      case 'PENDING': return 'bg-status-new text-white';
      default: return 'bg-background text-primary';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(booking.id)}
      className={`bg-white rounded-2xl p-5 border border-transparent hover:border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group ${onSelect ? 'cursor-pointer' : ''}`}
      data-testid="provider-booking-card"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-primary">{booking.user?.name || 'New Client'}</h3>
            <p className="text-xs text-muted">{new Date(booking.created_at).toLocaleString()}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
            {status?.replace('_', ' ')}
          </div>
        </div>
        <div className="bg-background rounded-xl p-3 text-sm text-muted mb-4">
          <p>&quot;{booking.notes}&quot;</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        {status === 'PENDING' && onUpdateStatus && (
          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking.id, 'CONFIRMED'); }} className="text-sm font-bold text-white bg-status-accepted px-4 py-2 rounded-xl hover:opacity-90 transition-colors shadow-sm">
            Accept
          </button>
        )}
        {status === 'CONFIRMED' && onUpdateStatus && (
          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking.id, 'EN_ROUTE'); }} className="text-sm font-bold text-white bg-status-new px-4 py-2 rounded-xl hover:opacity-90 transition-colors shadow-sm">
            On My Way
          </button>
        )}
        {status === 'EN_ROUTE' && onUpdateStatus && (
          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking.id, 'IN_PROGRESS'); }} className="text-sm font-bold text-white bg-primary px-4 py-2 rounded-xl hover:opacity-90 transition-colors shadow-sm">
            Arrived / Start
          </button>
        )}
        {status === 'IN_PROGRESS' && onUpdateStatus && (
          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking.id, 'COMPLETED'); }} className="text-sm font-bold text-white bg-status-completed px-4 py-2 rounded-xl hover:opacity-90 transition-colors shadow-sm">
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
