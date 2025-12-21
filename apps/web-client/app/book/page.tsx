'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AppBar } from '../../components/home/AppBar';

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceCode = searchParams.get('service');

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        date: '',
        time: '',
        notes: ''
    });

    // Mock Service Data (In real app, fetch this)
    const [serviceName, setServiceName] = useState('');
    const [basePrice, setBasePrice] = useState(0);

    useEffect(() => {
        if (!serviceCode) {
            toast.error('No service selected');
            router.push('/');
            return;
        }
        // In reality, we'd fetch service details here. mocking for now.
        setServiceName(serviceCode.replace(/-/g, ' ').toUpperCase());
        setBasePrice(499); // Mock base price
    }, [serviceCode, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.address || !formData.date || !formData.time) {
                throw new Error('Please fill in all required fields');
            }

            // Save Intent
            const bookingIntent = {
                service_code: serviceCode,
                service_name: serviceName,
                address: formData.address,
                schedule: `${formData.date} ${formData.time}`,
                notes: formData.notes,
                base_price: basePrice,
                final_price: basePrice, // + taxes
                issue_type: 'General Issue' // Default
            };

            localStorage.setItem('booking_intent', JSON.stringify(bookingIntent));

            // Navigate to AI Match
            router.push('/booking/match');

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />

            <div className="max-w-xl mx-auto px-4 py-8 mt-16">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Book Service</h1>
                    <p className="text-slate-500 mb-6">Complete your booking details for <span className="font-semibold text-indigo-600">{serviceName}</span></p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Service Address</label>
                            <textarea
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter full address, landmark, etc."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any specific instructions?"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center text-sm">
                            <span className="text-slate-600">Estimated Total</span>
                            <span className="text-lg font-bold text-slate-900">₹{basePrice}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Processing...' : 'Find Provider'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}
