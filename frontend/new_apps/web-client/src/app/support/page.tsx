'use client';

import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-neutral-50 pb-24">
            <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-30">
                <h1 className="text-xl font-bold text-neutral-900">Support</h1>
            </header>

            <main className="p-4 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-2">Contact Us</h2>
                    <p className="text-neutral-500 mb-6">We're here to help! Reach out to us through any of these channels.</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                            <Phone className="text-primary" size={24} />
                            <div>
                                <div className="font-medium text-neutral-900">Phone Support</div>
                                <div className="text-sm text-neutral-500">+91 98765 43210</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                            <Mail className="text-primary" size={24} />
                            <div>
                                <div className="font-medium text-neutral-900">Email</div>
                                <div className="text-sm text-neutral-500">support@thelokals.com</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                            <MessageSquare className="text-primary" size={24} />
                            <div>
                                <div className="font-medium text-neutral-900">Live Chat</div>
                                <div className="text-sm text-neutral-500">Available 9 AM - 6 PM</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
