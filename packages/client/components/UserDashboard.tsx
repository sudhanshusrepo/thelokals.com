
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

  const renderBookingsList = (bookingList: Booking[]) => {
    if (bookingList.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No requests here</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Your active bookings will appear here.</p>
        </div>
      );
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
      if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading your bookings...</div>;
      return (
        <div className="animate-fade-in">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <TabButton title="Upcoming" count={upcomingBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Active" count={activeBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Past" count={pastBookings.length} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'Upcoming' && renderBookingsList(upcomingBookings)}
                {activeTab === 'Active' && renderBookingsList(activeBookings)}
                {activeTab === 'Past' && renderBookingsList(pastBookings)}
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
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`
          }
        >
          {title} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200'}`}>{count}</span>
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
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden">
                         {booking.worker?.imageUrl ? <img src={booking.worker.imageUrl} className="w-full h-full object-cover" /> : '👤'}
                     </div>
                     <div>
                         <h3 className="font-bold text-gray-900 dark:text-white">{booking.worker?.name || 'Unknown Worker'}</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{booking.worker?.category} • {new Date(booking.date).toLocaleDateString()}</p>
                     </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
                 <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Total: ${booking.price}</p>
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
                                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Leave Review
                                </button>
                            )}
                        </>
                    )}
                     {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                        <button className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                            <span>📞</span> Call Expert
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
