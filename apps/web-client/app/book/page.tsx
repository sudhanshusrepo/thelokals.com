'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AppBar } from '../../components/home/AppBar';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuth } from '../../contexts/AuthContext';

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const serviceCode = searchParams.get('service');
    const priceParam = searchParams.get('price');
    const issueParam = searchParams.get('issue');

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        date: '',
        time: '',
        notes: ''
    });

    const [serviceName, setServiceName] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [issueType, setIssueType] = useState('General Issue');

    useEffect(() => {
        if (!serviceCode) {
            toast.error('No service selected');
            router.push('/');
            return;
        }

        // Get service details from query params or derive from code
        setServiceName(serviceCode.replace(/-/g, ' ').toUpperCase());
        setBasePrice(priceParam ? parseInt(priceParam) : 499);
        setIssueType(issueParam || 'General Issue');

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: today }));
    }, [serviceCode, priceParam, issueParam, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.address || !formData.date || !formData.time) {
                throw new Error('Please fill in all required fields');
            }

            // Validate date is not in the past
            const selectedDate = new Date(`${formData.date}T${formData.time}`);
            const now = new Date();
            if (selectedDate < now) {
                throw new Error('Please select a future date and time');
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
                issue_type: issueType
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
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <AppBar />

                <div className="max-w-xl mx-auto px-4 py-8 mt-16">
                    {/* User Info Card */}
                    {user && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.phone?.slice(-4) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-600">Booking as</p>
                                <p className="font-semibold text-slate-900">{user.phone || user.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Book Service</h1>
                        <p className="text-slate-500 mb-6">
                            Complete your booking details for <span className="font-semibold text-indigo-600">{serviceName}</span>
                            {issueType !== 'General Issue' && <span className="text-sm"> • {issueType}</span>}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Service Address *
                                </label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter full address, landmark, etc."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Time *
                                    </label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any specific instructions?"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600 text-sm">Base Price</span>
                                    <span className="font-medium text-slate-900">₹{basePrice}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                    <span className="text-slate-900 font-semibold">Estimated Total</span>
                                    <span className="text-xl font-bold text-indigo-600">₹{basePrice}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Final price may vary based on actual service</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : 'Find Provider'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthGuard>
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
