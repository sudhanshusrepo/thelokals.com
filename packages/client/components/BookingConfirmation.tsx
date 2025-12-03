
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { bookingService } from '@thelocals/core/services/bookingService';
import { Booking } from '@thelocals/core/types';
import { ProfileSkeleton } from './Skeleton';

const BookingConfirmation: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) return;

        const fetchBooking = async () => {
            try {
                const bookingData = await bookingService.getBooking(bookingId);
                setBooking(bookingData);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();

        const unsubscribe = bookingService.subscribeToBookingUpdates(bookingId, (updatedBooking) => {
            setBooking(updatedBooking);
        });

        return () => {
            unsubscribe();
        };
    }, [bookingId]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!booking) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Booking Not Found</h2>
                <p className="text-slate-500">We couldn't find the booking you're looking for.</p>
            </div>
        );
    }

    const getStatusInfo = () => {
        const status = booking.status?.toUpperCase();
        switch (status) {
            case 'PENDING':
                return { text: 'Searching for available providers...', color: 'text-yellow-500', icon: '🔍' };
            case 'CONFIRMED':
                return { text: 'Provider confirmed! They are on their way.', color: 'text-green-500', icon: '✅' };
            case 'IN_PROGRESS':
                return { text: 'Job is in progress.', color: 'text-blue-500', icon: '🔧' };
            case 'COMPLETED':
                return { text: 'Job completed successfully!', color: 'text-gray-500', icon: '🎉' };
            case 'CANCELLED':
                return { text: 'Booking has been cancelled.', color: 'text-red-500', icon: '❌' };
            default:
                return { text: 'Unknown status.', color: 'text-gray-500', icon: '❓' };
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-10 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in-up" data-testid="booking-confirmation">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">{getStatusInfo().icon}</div>
                <h1 className="text-3xl font-bold dark:text-white">Booking Created Successfully!</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Your request has been received. We are now finding a provider for you.
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-6 text-sm" data-testid="booking-details">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-600 dark:text-slate-300">Booking ID:</span>
                    <span className="font-mono bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded" data-testid="booking-id">{booking.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600 dark:text-slate-300">Status:</span>
                    <span className={`font-bold ${getStatusInfo().color}`} data-testid="booking-status">{getStatusInfo().text}</span>
                </div>
            </div>

            {booking.ai_checklist && (
                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 dark:text-white">Service Checklist</h3>
                    <ul className="list-disc list-inside bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        {booking.ai_checklist.map((item, index) => (
                            <li key={index} className="text-slate-700 dark:text-slate-300">{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="text-center">
                <Link to="/dashboard/bookings" className="text-teal-600 hover:underline">
                    View all your bookings
                </Link>
            </div>
        </div>
    );
};

export default BookingConfirmation;
