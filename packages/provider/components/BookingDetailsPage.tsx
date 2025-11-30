import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface BookingDetails {
    id: string;
    serviceName: string;
    description: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    clientName: string;
    clientPhone: string;
    clientRating: number;
    address: string;
    scheduledDate: Date;
    estimatedCost: number;
    yourEarnings: number;
    checklist: string[];
    notes?: string;
}

const BookingDetailsPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [checklistProgress, setChecklistProgress] = useState<boolean[]>([]);

    useEffect(() => {
        // Mock data - replace with Supabase query
        const mockBooking: BookingDetails = {
            id: bookingId || '1',
            serviceName: 'Leak Repair',
            description: 'Kitchen sink pipe leaking heavily. Water pooling under sink.',
            status: 'confirmed',
            clientName: 'Rajesh Kumar',
            clientPhone: '+91 98765 43210',
            clientRating: 4.5,
            address: '123, MG Road, Koramangala, Bangalore - 560034',
            scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
            estimatedCost: 500,
            yourEarnings: 425,
            checklist: [
                'Inspect sink pipe for damage',
                'Replace worn washer',
                'Seal all connections',
                'Test for leaks',
                'Clean work area'
            ],
            notes: 'Client mentioned the leak started 2 days ago. Bring extra washers.'
        };
        setBooking(mockBooking);
        setChecklistProgress(new Array(mockBooking.checklist.length).fill(false));
    }, [bookingId]);

    const toggleChecklistItem = (index: number) => {
        setChecklistProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = !newProgress[index];
            return newProgress;
        });
    };

    const updateStatus = (newStatus: BookingDetails['status']) => {
        if (booking) {
            setBooking({ ...booking, status: newStatus });
        }
    };

    if (!booking) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse">Loading booking details...</div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const completedItems = checklistProgress.filter(Boolean).length;
    const progressPercentage = (completedItems / booking.checklist.length) * 100;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{booking.serviceName}</h1>
                        <p className="text-slate-600">{booking.description}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                {/* Earnings */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-teal-50 p-4 rounded-lg">
                        <p className="text-sm text-teal-700 font-semibold mb-1">Your Earnings</p>
                        <p className="text-3xl font-bold text-teal-600">₹{booking.yourEarnings}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 font-semibold mb-1">Total Cost</p>
                        <p className="text-2xl font-bold text-slate-900">₹{booking.estimatedCost}</p>
                    </div>
                </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Client Information</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                            <p className="font-semibold text-slate-900">{booking.clientName}</p>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                <span>⭐</span>
                                <span>{booking.clientRating} rating</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📞</span>
                        <a href={`tel:${booking.clientPhone}`} className="text-teal-600 font-semibold hover:underline">
                            {booking.clientPhone}
                        </a>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📍</span>
                        <div>
                            <p className="text-slate-900">{booking.address}</p>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-sm hover:underline">
                                Open in Maps →
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🕐</span>
                        <p className="text-slate-900">
                            {booking.scheduledDate.toLocaleDateString()} at {booking.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Checklist */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">AI-Generated Checklist</h2>
                    <span className="text-sm font-semibold text-teal-600">
                        {completedItems}/{booking.checklist.length} completed
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-3">
                    {booking.checklist.map((item, index) => (
                        <label
                            key={index}
                            className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${checklistProgress[index]
                                    ? 'bg-teal-50 border-2 border-teal-500'
                                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={checklistProgress[index]}
                                onChange={() => toggleChecklistItem(index)}
                                className="mt-1 h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <span className={`flex-1 ${checklistProgress[index] ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {item}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Notes */}
            {booking.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1">Important Notes</h3>
                            <p className="text-amber-800">{booking.notes}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {booking.status === 'confirmed' && (
                        <button
                            onClick={() => updateStatus('in_progress')}
                            className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Start Job
                        </button>
                    )}
                    {booking.status === 'in_progress' && (
                        <button
                            onClick={() => updateStatus('completed')}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                            disabled={progressPercentage < 100}
                        >
                            {progressPercentage < 100 ? 'Complete Checklist First' : 'Mark as Completed'}
                        </button>
                    )}
                    <button
                        onClick={() => window.open(`tel:${booking.clientPhone}`)}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                    >
                        📞 Call Client
                    </button>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all"
                    >
                        Back to Requests
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;
