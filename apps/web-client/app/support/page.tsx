'use client';

import React from 'react';
import { AppBar } from '../../components/home/AppBar';
import { Mail, MessageCircle, Phone } from 'lucide-react';

export default function SupportPage() {

    const faqs = [
        { q: "How do I cancel a booking?", a: "You can cancel a booking from the Bookings tab, provided a provider hasn't already started the job." },
        { q: "How are prices calculated?", a: "Prices are based on standard service rates plus any additional parts or time required." },
        { q: "Is there a warranty?", a: "Yes, all our services come with a 7-day service warranty for your peace of mind." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <AppBar />

            <div className="pt-20 px-4 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Help & Support</h1>

                {/* Contact Actions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <MessageCircle size={20} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">Live Chat</span>
                    </button>
                    <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <Phone size={20} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">Call Us</span>
                    </button>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-900">Frequently Asked Questions</h2>
                    </div>
                    {faqs.map((faq, i) => (
                        <div key={i} className="p-4 border-b border-slate-50 last:border-none">
                            <h3 className="font-medium text-slate-900 mb-1">{faq.q}</h3>
                            <p className="text-sm text-slate-500">{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">Version 1.0.0 • The Lokals</p>
                </div>
            </div>
        </div>
    );
}
