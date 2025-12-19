import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setBookings(data);
        setLoading(false);
    };

    if (loading) return <div className="p-8">Loading bookings...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Booking History & Ratings</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4">Issue Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-xs text-gray-500">
                                    {booking.id.slice(0, 8)}
                                </td>
                                <td className="p-4 font-medium">
                                    {booking.service_name || booking.service_code}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    ₹{(booking.total_amount_cents || booking.base_price_cents) / 100}
                                </td>
                                <td className="p-4">
                                    {booking.customer_rating ? (
                                        <div className="flex flex-col">
                                            <div className="flex text-amber-400 font-bold">
                                                {booking.customer_rating} ★
                                            </div>
                                            {booking.customer_review && (
                                                <span className="text-xs text-gray-400 italic truncate max-w-[150px]">
                                                    "{booking.customer_review}"
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-xs">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {booking.issue_type ? (
                                        <span className={booking.issue_type.includes('Urgent') ? 'text-red-600 font-bold' : ''}>
                                            {booking.issue_type}
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
