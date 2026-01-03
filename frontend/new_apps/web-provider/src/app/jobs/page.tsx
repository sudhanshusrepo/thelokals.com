'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useEffect, useState } from 'react';
import { bookingService } from '@thelocals/core/services/bookingService';
import { Booking, DbBookingRequest } from '@thelocals/core';
import { MapPin, Calendar, Clock, CheckCircle2, XCircle, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JobsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [requests, setRequests] = useState<DbBookingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');

    useEffect(() => {
        if (user?.id) {
            loadJobs(user.id);
        }
    }, [user]);

    const loadJobs = async (userId: string) => {
        setLoading(true);
        try {
            const [jobsData, requestsData] = await Promise.all([
                bookingService.getWorkerBookings(userId),
                bookingService.getProviderRequests(userId)
            ]);
            setBookings(jobsData);
            setRequests(requestsData);

            // Auto-select tab based on data
            if (requestsData.length > 0) setActiveTab('requests');
            else if (jobsData.length > 0) setActiveTab('active');

        } catch (error) {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (bookingId: string) => {
        if (!user?.id) return;
        try {
            await bookingService.acceptBooking(bookingId, user.id);
            toast.success("Job Accepted");
            loadJobs(user.id);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getFilteredList = () => {
        if (activeTab === 'requests') return requests;
        return bookings.filter(b => {
            if (activeTab === 'active') {
                return ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'].includes(b.status);
            }
            return ['COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'].includes(b.status);
        });
    };

    const filteredItems = getFilteredList();

    return (
        <ProviderLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">My Jobs</h1>
                    <p className="text-neutral-500">Manage your bookings and service requests.</p>
                </div>
                <div className="bg-white rounded-lg p-1 border border-neutral-200 flex overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'requests' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        <Bell size={14} />
                        Requests
                        {requests.length > 0 && (
                            <span className="bg-white/20 text-white px-1.5 rounded-full text-xs">{requests.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'active' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Active Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-neutral-500">Loading jobs...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-200 border-dashed">
                        <p className="text-neutral-500">No {activeTab} found.</p>
                    </div>
                ) : (
                    filteredItems.map((item: any) => {
                        // Handle both Booking and DbBookingRequest structures
                        const isRequest = activeTab === 'requests';
                        const booking = isRequest ? item.bookings : item;

                        // Safety check if booking relation is missing
                        if (!booking) return null;

                        return (
                            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-lg text-neutral-900">{booking.service_category || 'Service Request'}</h3>
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                isRequest ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {isRequest ? 'NEW REQUEST' : booking.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-neutral-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-neutral-400" />
                                            <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-neutral-400" />
                                            <span>{booking.address?.formatted || 'Location details protected'}</span>
                                        </div>
                                        {booking.estimated_cost && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-neutral-900">₹{booking.estimated_cost}</span>
                                                <span className="text-xs text-neutral-400">(Est.)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-2 min-w-[150px]">
                                    {isRequest && (
                                        <button
                                            onClick={() => handleAccept(booking.id)}
                                            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <CheckCircle2 size={16} /> Accept Job
                                        </button>
                                    )}
                                    <button className="w-full py-2 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </ProviderLayout>
    );
}
