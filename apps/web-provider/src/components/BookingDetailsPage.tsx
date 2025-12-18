import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingService } from '@thelocals/core/services/bookingService';
import { Booking, BookingStatus } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';

const BookingDetailsPage: React.FC = () => {
    const params = useParams();
    const bookingId = params?.bookingId as string;
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [checklistProgress, setChecklistProgress] = useState<boolean[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) return;

        const fetchBooking = async () => {
            try {
                setLoading(true);
                const data = await bookingService.getBooking(bookingId);
                setBooking(data);
                if (data.ai_checklist) {
                    setChecklistProgress(new Array(data.ai_checklist.length).fill(false));
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
                toast.error('Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    const toggleChecklistItem = (index: number) => {
        setChecklistProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = !newProgress[index];
            return newProgress;
        });
    };

    const updateStatus = async (newStatus: BookingStatus) => {
        if (!booking) return;

        try {
            await bookingService.updateBookingStatus(booking.id, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            // Optimistic update
            setBooking({ ...booking, status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse">Loading booking details...</div>
            </div>
        );
    }

    if (!booking) {
        return <div className="text-center py-20">Booking not found</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'EN_ROUTE': return 'bg-indigo-100 text-indigo-800';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const checklist = booking.ai_checklist || [];
    const completedItems = checklistProgress.filter(Boolean).length;
    const progressPercentage = checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl pb-24">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{booking.service_category}</h1>
                        <p className="text-slate-600">ID: {booking.id.slice(0, 8)}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                {/* Earnings */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-semibold mb-1">Your Earnings</p>
                        <p className="text-3xl font-bold text-primary">₹{booking.final_cost || booking.estimated_cost}</p>
                    </div>
                    {/* 
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 font-semibold mb-1">Total Cost</p>
                        <p className="text-2xl font-bold text-slate-900">₹{booking.estimated_cost}</p>
                    </div>
                    */}
                </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Client Information</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                            <p className="font-semibold text-slate-900">Client ID: {booking.client_id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📍</span>
                        <div className="pt-1">
                            {/* Address placeholder as structured address might be empty in initial AI booking */}
                            <p className="text-slate-900 text-sm">Location provided via map</p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${(booking.location as any)?.coordinates?.[1]},${(booking.location as any)?.coordinates?.[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-sm hover:underline font-semibold"
                            >
                                Open Coordinates in Maps →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Checklist */}
            {checklist.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">AI-Generated Checklist</h2>
                        <span className="text-sm font-semibold text-primary">
                            {completedItems}/{checklist.length} completed
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {checklist.map((item, index) => (
                            <label
                                key={index}
                                className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${checklistProgress[index]
                                    ? 'bg-blue-50 border-2 border-primary'
                                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checklistProgress[index]}
                                    onChange={() => toggleChecklistItem(index)}
                                    className="mt-1 h-5 w-5 text-primary rounded focus:ring-primary"
                                />
                                <span className={`flex-1 ${checklistProgress[index] ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                    {item}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Status Transitions */}
                    {booking.status === 'CONFIRMED' && (
                        <button
                            onClick={() => updateStatus('EN_ROUTE')}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            🚚 I'm on my way
                        </button>
                    )}

                    {booking.status === 'EN_ROUTE' && (
                        <button
                            onClick={() => updateStatus('IN_PROGRESS')}
                            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                        >
                            🔧 Start Job
                        </button>
                    )}

                    {booking.status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => updateStatus('COMPLETED')}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                            disabled={progressPercentage < 100}
                        >
                            {progressPercentage < 100 ? 'Complete Checklist First' : '✅ Mark as Completed'}
                        </button>
                    )}

                    {booking.status === 'COMPLETED' && (
                        <div className="col-span-2 text-center p-4 bg-green-50 text-green-800 rounded-lg font-bold border border-green-200">
                            Job Completed Successfully
                        </div>
                    )}


                    <button
                        onClick={() => router.push('/bookings')}
                        className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all"
                    >
                        Back to requests
                    </button>
                </div>
            </div>
        </div>
    );
};

export { BookingDetailsPage };
export default BookingDetailsPage;
