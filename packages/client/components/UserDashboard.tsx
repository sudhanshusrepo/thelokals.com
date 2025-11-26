
import React, { useEffect, useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { bookingService } from '../../core/services/bookingService';
import { Booking, BookingStatus } from '../../core/types';
import { ReviewModal } from './ReviewModal';
import { PaymentModal } from './PaymentModal';
import { Profile } from './Profile';
import { TermsAndConditions } from './TermsAndConditions';
import { Support } from './Support';
import { User } from '@supabase/supabase-js';
import { ICONS } from '../constants';

export type DashboardView = 'Bookings' | 'Profile' | 'Terms & Conditions' | 'Support';
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
  
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const activeBookings = bookings.filter(b => b.status === 'in_progress');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const getEmptyState = (tab: Tab) => {
    const messages = {
      Upcoming: {
        icon: '📅',
        title: 'No upcoming bookings',
        text: 'When you book a service, it will show up here.'
      },
      Active: {
        icon: '🏃',
        title: 'No active jobs',
        text: 'Services that are currently in progress will be displayed here.'
      },
      Past: {
        icon: '🗂️',
        title: 'No past bookings',
        text: 'Your completed or cancelled bookings will be listed in this section.'
      }
    }
    const {icon, title, text} = messages[tab];
    return (
       <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="text-6xl mb-4">{icon}</div>
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
        <div className="animate-fade-in">
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <TabButton title="Upcoming" count={upcomingBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Active" count={activeBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Past" count={pastBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'Upcoming' && renderBookingsList(upcomingBookings, 'Upcoming')}
                {activeTab === 'Active' && renderBookingsList(activeBookings, 'Active')}
                {activeTab === 'Past' && renderBookingsList(pastBookings, 'Past')}
            </div>
      </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
        {/* Based on the initialView prop, render the correct component directly */}
        {initialView === 'Bookings' && renderBookingsView()}
        {initialView === 'Profile' && <Profile />}
        {initialView === 'Terms & Conditions' && <TermsAndConditions />}
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
const TabButton: React.FC<{title: Tab, count: number, activeTab: Tab, setActiveTab: (tab: Tab) => void}> = ({ title, count, activeTab, setActiveTab }) => {
    const isActive = activeTab === title;
    return (
        <button
          onClick={() => setActiveTab(title)}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
            ${
              isActive
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`
          }
        >
          {title} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-200'}`}>{count}</span>
        </button>
    );
}

const BookingCard: React.FC<{booking: Booking, setPaymentBooking: (b: Booking) => void, setReviewBooking: (b: Booking) => void}> = ({ booking, setPaymentBooking, setReviewBooking }) => {
    const getStatusColor = (status: BookingStatus) => {
        switch(status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl overflow-hidden">
                         {booking.worker?.imageUrl ? <img src={booking.worker.imageUrl} className="w-full h-full object-cover" /> : '👤'}
                     </div>
                     <div>
                         <h3 className="font-bold text-slate-900 dark:text-white">{booking.worker?.name || 'Unknown Worker'}</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{booking.worker?.category} • {new Date(booking.date).toLocaleDateString()}</p>
                     </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
                 <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Total: ${booking.price}</p>
                <div className="flex gap-2">
                    {booking.status === 'completed' && (
                        <>
                            {(!booking.payment_status || booking.payment_status === 'pending') ? (
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
                     {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                        <button className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> 
                            Call Expert
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
