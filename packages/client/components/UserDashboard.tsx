import React, { useEffect, useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { bookingService } from '../../core/services/bookingService';
import { Booking, BookingStatus } from '../../core/types';
import { ReviewModal } from './ReviewModal';
import { PaymentModal } from './PaymentModal';
import { Profile } from './Profile';
import { TermsAndConditions } from './TermsAndConditions';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Support } from './Support';
import { User } from '@supabase/supabase-js';
import { ICONS } from '../constants';

export type DashboardView = 'Bookings' | 'Profile' | 'Terms & Conditions' | 'Privacy Policy' | 'Support';
type Tab = 'Upcoming' | 'Active' | 'Past';

interface UserDashboardProps {
  initialView?: DashboardView;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ initialView = 'Bookings' }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');

  const fetchBookings = async (userId: string) => {
    setLoading(true);
    try {
      const data = await bookingService.getUserBookings(userId);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchBookings(user.id);
      }
    };
    fetchUserAndBookings();
  }, []);

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setBookings((current) =>
              current.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b)
            );
            // Refetch to be sure
            fetchBookings(user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const upcomingBookings = bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED');
  const activeBookings = bookings.filter(b => b.status?.toUpperCase() === 'IN_PROGRESS');
  const pastBookings = bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED' || b.status?.toUpperCase() === 'CANCELLED');

  const DynamicCalendarIcon = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();

    return (
      <div className="w-20 h-20 mx-auto mb-4 flex flex-col bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 overflow-hidden">
        <div className="bg-red-500 text-white text-xs font-bold py-1.5 uppercase tracking-wider">
          {month}
        </div>
        <div className="flex-1 flex items-center justify-center text-3xl font-bold text-slate-800 dark:text-white">
          {day}
        </div>
      </div>
    );
  };

  const getEmptyState = (tab: Tab) => {
    const messages = {
      Upcoming: {
        icon: <DynamicCalendarIcon />,
        title: 'No upcoming bookings',
        text: 'When you book a service, it will show up here.'
      },
      Active: {
        icon: <div className="text-6xl mb-4">🏃</div>,
        title: 'No active jobs',
        text: 'Services that are currently in progress will be displayed here.'
      },
      Past: {
        icon: <div className="text-6xl mb-4">🗂️</div>,
        title: 'No past bookings',
        text: 'Your completed or cancelled bookings will be listed in this section.'
      }
    }
    const { icon, title, text } = messages[tab];
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
        {icon}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{text}</p>
      </div>
    );
  };

  const renderBookingsList = (bookingList: Booking[], tab: Tab) => {
    if (bookingList.length === 0) {
      return getEmptyState(tab);
    }
    return (
      <div className="space-y-4">
        {bookingList.map((booking) => (
          <BookingCard key={booking.id} booking={booking} setPaymentBooking={setPaymentBooking} setReviewBooking={setReviewBooking} />
        ))}
      </div>
    );
  };

  const renderBookingsView = () => {
    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading your bookings...</div>;
    return (
      <div className="animate-fade-in" data-testid="user-dashboard">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* Mobile Number Prompt Banner */}
          {user && !user.phone && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Add your mobile number</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Secure your account and enable mobile login.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.href = '/dashboard/profile';
                }}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/40 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-lg transition-colors"
              >
                Add Now
              </button>
            </div>
          )}

          <div className="border-b border-slate-100 dark:border-slate-700 px-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <TabButton title="Upcoming" count={upcomingBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} testId="tab-upcoming" />
              <TabButton title="Active" count={activeBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} testId="tab-active" />
              <TabButton title="Past" count={pastBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} testId="tab-past" />
            </nav>
          </div>
        </div>

        <div className="mt-6" data-testid="bookings-list">
          {activeTab === 'Upcoming' && renderBookingsList(upcomingBookings, 'Upcoming')}
          {activeTab === 'Active' && renderBookingsList(activeBookings, 'Active')}
          {activeTab === 'Past' && renderBookingsList(pastBookings, 'Past')}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Based on the initialView prop, render the correct component directly */}
      {initialView === 'Bookings' && renderBookingsView()}
      {initialView === 'Profile' && <Profile />}
      {initialView === 'Terms & Conditions' && <TermsAndConditions />}
      {initialView === 'Privacy Policy' && <PrivacyPolicy />}
      {initialView === 'Support' && <Support />}

      {/* Modals remain at this level to be displayed over the content */}
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onPaymentSuccess={() => user && fetchBookings(user.id)}
        />
      )}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onReviewSubmitted={() => user && fetchBookings(user.id)}
        />
      )}
    </div>
  );
};


// Sub-components for clarity
const TabButton: React.FC<{ title: Tab, count: number, activeTab: Tab, setActiveTab: (tab: Tab) => void, testId?: string }> = ({ title, count, activeTab, setActiveTab, ...props }) => {
  const isActive = activeTab === title;
  return (
    <button
      onClick={() => setActiveTab(title)}
      data-testid={props.testId}
      className={`relative whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200
            ${isActive
          ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-gradient-to-t from-teal-50/50 to-transparent dark:from-teal-900/20 -translate-y-0.5 shadow-sm'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`
      }
    >
      {title} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${isActive ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 scale-105' : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-200'}`}>{count}</span>
      {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"></div>}
    </button>
  );
}

const BookingCard: React.FC<{ booking: Booking, setPaymentBooking: (b: Booking) => void, setReviewBooking: (b: Booking) => void }> = ({ booking, setPaymentBooking, setReviewBooking }) => {
  const getStatusColor = (status: BookingStatus) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const status = booking.status?.toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow relative overflow-hidden" data-testid="booking-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl overflow-hidden">
            {booking.worker?.imageUrl ? <img src={booking.worker.imageUrl} className="w-full h-full object-cover" loading="lazy" alt={booking.worker.name} /> : '👤'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{booking.worker?.name || 'Unknown Worker'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{booking.worker?.category} • {new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
          {status}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Total: ${booking.final_cost || booking.estimated_cost || 0}</p>
        <div className="flex gap-2">
          {status === 'COMPLETED' && (
            <>
              {(!booking.payment_status || booking.payment_status.toUpperCase() === 'PENDING') ? (
                <button
                  onClick={() => setPaymentBooking(booking)}
                  className="text-sm font-bold text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md shadow-green-200 dark:shadow-none"
                >
                  Pay Now
                </button>
              ) : (
                <button
                  onClick={() => setReviewBooking(booking)}
                  className="text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-slate-700 px-4 py-2 rounded-lg hover:bg-teal-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Leave Review
                </button>
              )}
            </>
          )}
          {(status === 'CONFIRMED' || status === 'IN_PROGRESS') && (
            <button className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              Call Expert
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
