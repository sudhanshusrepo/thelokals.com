'use client';

import React from 'react';
import { HelpCircle, MessageCircle, Mail, ChevronRight } from 'lucide-react';

export default function HelpPage() {
    const faqs = [
        { id: 1, question: 'How do I cancel a booking?', answer: 'Go to your bookings, select the active booking, and click "Cancel Booking". Cancellation fees may apply.' },
        { id: 2, question: 'Is my payment safe?', answer: 'Yes, all payments are processed securely via Razorpay/Stripe.' },
        { id: 3, question: 'Are the providers verified?', answer: 'Absolutely. All our providers undergo background checks and skill verification.' }
    ];

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
            <h1 className="text-2xl font-bold text-v2-text-primary mb-6">Help & Support</h1>

            {/* Support Channels */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <a href="#" className="bg-white p-4 rounded-v2-card border border-gray-100 hover:border-v2-primary transition-all flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">WhatsApp</div>
                        <div className="text-xs text-gray-500">Instant Chat</div>
                    </div>
                </a>
                <a href="#" className="bg-white p-4 rounded-v2-card border border-gray-100 hover:border-v2-primary transition-all flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Mail size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">Email</div>
                        <div className="text-xs text-gray-500">support@lokals.com</div>
                    </div>
                </a>
            </div>

            {/* FAQs */}
            <h3 className="text-lg font-bold text-v2-text-primary mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
                {faqs.map(faq => (
                    <details key={faq.id} className="group bg-white rounded-v2-card border border-gray-100 overflow-hidden">
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                            {faq.question}
                            <ChevronRight size={16} className="text-gray-400 transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                            {faq.answer}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}
