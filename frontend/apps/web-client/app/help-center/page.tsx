'use client';

import Link from 'next/link';
import { Mail, Phone, MessageCircle, Clock } from 'lucide-react';

export default function HelpCenter() {
    const faqs = [
        {
            question: "How do I book a service?",
            answer: "Simply search for the service you need, select your preferred provider, choose a time slot, and confirm your booking. You'll receive instant confirmation."
        },
        {
            question: "How do I cancel or reschedule?",
            answer: "Go to 'My Bookings', select the booking you want to modify, and choose 'Cancel' or 'Reschedule'. Cancellation policies vary by service."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our platform."
        },
        {
            question: "How are service providers verified?",
            answer: "All providers undergo background verification, skill assessment, and document verification before being approved on our platform."
        },
        {
            question: "What if I'm not satisfied with the service?",
            answer: "Contact our support team within 24 hours of service completion. We'll work with you to resolve the issue or provide appropriate compensation."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Help Center</h1>
                    <p className="text-white/90">Find answers to common questions</p>
                </div>
            </div>

            {/* Contact Options */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <Link href="/contact-us" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 text-center group">
                        <Mail className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                        <p className="text-sm text-muted">support@lokals.com</p>
                    </Link>

                    <a href="tel:+911234567890" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 text-center group">
                        <Phone className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                        <p className="text-sm text-muted">+91 123 456 7890</p>
                    </a>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
                        <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
                        <h3 className="font-semibold text-foreground mb-1">Support Hours</h3>
                        <p className="text-sm text-muted">Mon-Sun: 9 AM - 9 PM</p>
                    </div>
                </div>

                {/* FAQs */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <details key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 group">
                                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                                    {faq.question}
                                    <span className="text-accent group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-muted mt-4 leading-relaxed">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Still Need Help */}
                <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center border border-indigo-100">
                    <MessageCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Still need help?</h3>
                    <p className="text-muted mb-6">Our support team is here to assist you</p>
                    <Link
                        href="/contact-us"
                        className="inline-block bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
