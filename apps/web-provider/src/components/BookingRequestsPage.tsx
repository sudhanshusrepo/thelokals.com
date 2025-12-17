
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncomingRequestModal } from './IncomingRequestModal';
import { supabase, bookingService } from '@thelocals/core';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Booking, DbBookingRequest } from '@thelocals/core/types';

const BookingRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Assuming useAuth returns { user: User | null }
    const [requests, setRequests] = useState<DbBookingRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<DbBookingRequest | null>(null);
    const [filter, setFilter] = useState<'pending' | 'accepted' | 'rejected'>('pending');
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        if (!user?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('booking_requests')
            .select('*, bookings(*)')
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch requests');
        } else {
            // calculated move: supabase returns data as any[] or generic T[], 
            // but we know the structure because of the select query.
            setRequests(data as unknown as DbBookingRequest[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();

        if (!user?.id) return;

        // Realtime Subscription
        const channel = supabase
            .channel('public:booking_requests')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'booking_requests',
                filter: `provider_id=eq.${user.id}`
            }, (payload) => {
                // Refresh full list on any change for simplicity (or handle optimistic updates)
                fetchRequests();
                if (payload.eventType === 'INSERT') {
                    toast.success('New Job Request Received!');
                    // Play sound?
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const filteredRequests = requests.filter(req => {
        if (filter === 'pending') return req.status === 'PENDING';
        if (filter === 'accepted') return req.status === 'ACCEPTED';
        if (filter === 'rejected') return req.status === 'REJECTED';
        return true;
    });

    const handleAccept = async (request: DbBookingRequest) => {
        if (!user?.id) return;
        try {
            await bookingService.acceptBooking(request.booking_id, user.id);
            toast.success('Booking Accepted!');
            setSelectedRequest(null);
            navigate(`/booking/${request.booking_id}`); // Navigate to details
        } catch (error) {
            toast.error('Failed to accept booking. It might be taken.');
        }
    };

    const handleReject = async (request: DbBookingRequest) => {
        if (!user?.id) return;
        try {
            await bookingService.rejectBooking(request.booking_id, user.id);
            toast.success('Booking Rejected');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to reject booking');
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading && requests.length === 0) {
        return <div className="p-8 text-center">Loading requests...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in p-4 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Requests</h1>
                <p className="text-slate-600">Real-time jobs in your area</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['pending', 'accepted', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No {filter} requests</h3>
                    <p className="text-slate-600">
                        {filter === 'pending'
                            ? 'New requests will appear here automatically'
                            : `No ${filter} requests found`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(req => {
                        const booking = req.bookings;
                        if (!booking) return null; // Should not happen with inner join or proper data

                        return (
                            <div
                                key={req.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-teal-500"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold text-slate-900">{booking.service_category || 'Service'}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mb-3">{booking.notes || 'No description provided'}</p>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <span>👤</span>
                                                <span>Client (ID: {booking.client_id.slice(0, 4)})</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>🕐</span>
                                                <span>{getTimeAgo(req.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>💰</span>
                                                <span className="font-bold text-teal-600">₹{booking.final_cost || booking.estimated_cost || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>📍</span>
                                                {/* Distance placeholder */}
                                                <span>Nearby</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {req.status === 'PENDING' && (
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="flex-1 px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all"
                                        >
                                            View & Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(req)}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-all"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}

                                {req.status === 'ACCEPTED' && (
                                    <button
                                        onClick={() => navigate(`/booking/${req.booking_id}`)}
                                        className="w-full px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg hover:bg-teal-100 transition-all"
                                    >
                                        Go to Job
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Incoming Request Modal */}
            {selectedRequest && selectedRequest.bookings && (
                <IncomingRequestModal
                    service={{
                        id: 's1',
                        name: selectedRequest.bookings.service_category || 'Service',
                        description: selectedRequest.bookings.notes || '',
                        price: selectedRequest.bookings.estimated_cost || 0,
                        duration: '1 hr'
                    }}
                    distance="Nearby"
                    earnings={selectedRequest.bookings.estimated_cost || 0}
                    estimatedCost={selectedRequest.bookings.estimated_cost || 0}
                    checklist={selectedRequest.bookings.ai_checklist || []}
                    onAccept={() => handleAccept(selectedRequest)}
                    onReject={() => handleReject(selectedRequest)}
                />
            )}
        </div>
    );
};

export { BookingRequestsPage };
export default BookingRequestsPage;
