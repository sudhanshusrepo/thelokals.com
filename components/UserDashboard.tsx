import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { Booking, BookingStatus } from '../types';
import { supabase } from '../services/supabase';
import { ReviewModal } from './ReviewModal';
import { PaymentModal } from './PaymentModal';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const data = await bookingService.getUserBookings(user.id);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Subscribe to Realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
           // Optimistically update the specific booking in the list
           setBookings((current) => 
             current.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b)
           );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const getStatusLabel = (status: BookingStatus) => {
      switch(status) {
          case 'pending': return 'Waiting for acceptance';
          case 'confirmed': return 'Expert is on the way';
          case 'in_progress': return 'Job in progress';
          case 'completed': return 'Job Completed';
          default: return status;
      }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading dashboard...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Requests</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">Live Updates Active <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse"></span></div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No requests yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find a local expert to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow relative overflow-hidden">
                    {/* Status Banner for active jobs */}
                    {booking.status === 'confirmed' && (
                         <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse-slow"></div>
                    )}

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

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <p className="line-clamp-2">"{booking.note}"</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {getStatusLabel(booking.status)}
                        </p>

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
                                    <span>📞</span> Call
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {paymentBooking && (
          <PaymentModal
            booking={paymentBooking}
            onClose={() => setPaymentBooking(null)}
            onPaymentSuccess={fetchBookings}
          />
      )}

      {reviewBooking && (
          <ReviewModal 
            booking={reviewBooking} 
            onClose={() => setReviewBooking(null)} 
            onReviewSubmitted={fetchBookings}
          />
      )}
    </div>
  );
};