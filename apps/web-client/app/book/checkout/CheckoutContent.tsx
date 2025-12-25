'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppBar } from '../../../components/home/AppBar';
import { Footer } from '../../../components/home/Footer';

export default function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Mock Params
    const serviceName = searchParams.get('serviceName') || "Requested Service";
    const priceParam = searchParams.get('price');
    const price = priceParam ? `₹${priceParam}` : "TBD";
    const tier = searchParams.get('tier') || "Standard";

    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [payWithWallet, setPayWithWallet] = useState(false);
    const [instructions, setInstructions] = useState('');

    const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    const dates = ['Today', 'Tomorrow', 'Sat, 28 Dec'];

    const handleConfirmBooking = () => {
        // Mock Booking Creation
        // Navigate to Unified Tracker
        router.push(`/booking/new_created_123`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />

            <main className="max-w-3xl mx-auto px-4 pt-24 pb-32">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 transition-colors shadow-sm text-slate-600"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Service Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Service Details</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{serviceName}</h2>
                                    <p className="text-slate-500 text-sm">{tier}</p>
                                </div>
                                <div className="ml-auto text-xl font-bold text-slate-900">
                                    {price}
                                </div>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">When</h3>

                            <div className="flex flex-wrap gap-3 mb-4">
                                {dates.map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setSelectedDate(d)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedDate === d
                                            ? 'bg-teal-50 border-teal-500 text-teal-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {timeSlots.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTime(t)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedTime === t
                                            ? 'bg-teal-50 border-teal-500 text-teal-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Location</h3>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="mt-1 text-red-500">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-slate-900">Home</h4>
                                        <button className="text-sm font-bold text-teal-600 hover:text-teal-700">Edit</button>
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        No location detected. Tap 'Edit' to set address.
                                    </p>
                                </div>
                            </div>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Add instructions (e.g., Gate code, landmark)"
                                className="w-full bg-slate-50 border-0 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 resize-none h-24"
                            />
                        </div>

                    </div>

                    {/* Sidebar / Bottom Action */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-slate-700">Cash after service</span>
                                    </div>
                                    {!payWithWallet && (
                                        <div className="text-teal-500">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-slate-700">Wallet Balance (₹0)</span>
                                    </div>
                                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="absolute w-full h-full opacity-0 cursor-pointer"
                                            checked={payWithWallet}
                                            onChange={(e) => setPayWithWallet(e.target.checked)}
                                        />
                                        <span className={`block w-full h-full rounded-full transition-colors duration-200 ${payWithWallet ? 'bg-teal-500' : 'bg-slate-200'}`} />
                                        <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm ${payWithWallet ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm">Total to Pay</span>
                                    <span className="text-2xl font-bold text-slate-900">{price}</span>
                                </div>
                                <button
                                    onClick={handleConfirmBooking}
                                    className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
