import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncomingRequestModal } from './IncomingRequestModal';
import { ServiceType } from '@core/types';

interface BookingRequest {
    id: string;
    service: ServiceType;
    distance: string;
    earnings: number;
    estimatedCost: number;
    checklist?: string[];
    clientName: string;
    clientRating: number;
    requestedAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
}

const BookingRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');

    // Mock data - will be replaced with real Supabase subscription
    useEffect(() => {
        const mockRequests: BookingRequest[] = [
            {
                id: '1',
                service: {
                    id: 'plumbing-1',
                    name: 'Leak Repair',
                    description: 'Kitchen sink pipe leaking heavily',
                    price: 500,
                    duration: '1 hr'
                },
                distance: '2.5 km',
                earnings: 425,
                estimatedCost: 500,
                checklist: ['Inspect sink pipe', 'Replace worn washer', 'Seal connections', 'Test for leaks'],
                clientName: 'Rajesh Kumar',
                clientRating: 4.5,
                requestedAt: new Date(Date.now() - 10 * 60000),
                status: 'pending'
            },
            {
                id: '2',
                service: {
                    id: 'electrical-1',
                    name: 'Fan Installation',
                    description: 'Install ceiling fan in bedroom',
                    price: 800,
                    duration: '2 hrs'
                },
                distance: '4.2 km',
                earnings: 680,
                estimatedCost: 800,
                checklist: ['Check ceiling support', 'Install mounting bracket', 'Wire connections', 'Test operation'],
                clientName: 'Priya Sharma',
                clientRating: 5.0,
                requestedAt: new Date(Date.now() - 30 * 60000),
                status: 'pending'
            }
        ];
        setRequests(mockRequests);
    }, []);

    const filteredRequests = requests.filter(req =>
        filter === 'all' ? true : req.status === filter
    );

    const handleAccept = (requestId: string) => {
        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'accepted' as const } : req
        ));
        setSelectedRequest(null);
        navigate(`/booking/${requestId}`);
    };

    const handleReject = (requestId: string) => {
        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'rejected' as const } : req
        ));
        setSelectedRequest(null);
    };

    const getTimeAgo = (date: Date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Requests</h1>
                <p className="text-slate-600">Manage incoming booking requests from customers</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'pending', 'accepted', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {requests.filter(r => r.status === status).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No {filter !== 'all' && filter} requests</h3>
                    <p className="text-slate-600">
                        {filter === 'pending'
                            ? 'New booking requests will appear here'
                            : `You don't have any ${filter} requests`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <div
                            key={request.id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-teal-500"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900">{request.service.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mb-3">{request.service.description}</p>

                                    {/* Client Info */}
                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <span>👤</span>
                                            <span>{request.clientName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>⭐</span>
                                            <span>{request.clientRating}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>📍</span>
                                            <span>{request.distance}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>🕐</span>
                                            <span>{getTimeAgo(request.requestedAt)}</span>
                                        </div>
                                    </div>

                                    {/* Earnings */}
                                    <div className="flex items-center gap-4">
                                        <div className="bg-teal-50 px-4 py-2 rounded-lg">
                                            <p className="text-xs text-teal-700 font-semibold">Your Earnings</p>
                                            <p className="text-2xl font-bold text-teal-600">₹{request.earnings}</p>
                                        </div>
                                        <div className="bg-slate-50 px-4 py-2 rounded-lg">
                                            <p className="text-xs text-slate-600 font-semibold">Estimated Cost</p>
                                            <p className="text-lg font-bold text-slate-900">₹{request.estimatedCost}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {request.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => setSelectedRequest(request)}
                                        className="flex-1 px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all"
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}

                            {request.status === 'accepted' && (
                                <button
                                    onClick={() => navigate(`/booking/${request.id}`)}
                                    className="w-full px-4 py-2 bg-teal-100 text-teal-700 font-bold rounded-lg hover:bg-teal-200 transition-all mt-4"
                                >
                                    View Booking Details →
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Incoming Request Modal */}
            {selectedRequest && (
                <IncomingRequestModal
                    service={selectedRequest.service}
                    distance={selectedRequest.distance}
                    earnings={selectedRequest.earnings}
                    estimatedCost={selectedRequest.estimatedCost}
                    checklist={selectedRequest.checklist}
                    onAccept={() => handleAccept(selectedRequest.id)}
                    onReject={() => handleReject(selectedRequest.id)}
                />
            )}
        </div>
    );
};

export default BookingRequestsPage;
