'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
                    <p className="text-white/90">We'd love to hear from you</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>

                        {submitted && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="text-green-600" size={20} />
                                <p className="text-green-800 text-sm">Message sent successfully! We'll get back to you soon.</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                                <select
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="booking">Booking Issue</option>
                                    <option value="payment">Payment Issue</option>
                                    <option value="provider">Provider Feedback</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                                <textarea
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                                    placeholder="Tell us how we can help..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-accent" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                                    <p className="text-muted text-sm mb-2">Our support team is here to help</p>
                                    <a href="mailto:support@lokals.com" className="text-accent hover:underline">
                                        support@lokals.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="text-accent" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                                    <p className="text-muted text-sm mb-2">Mon-Sun: 9 AM - 9 PM IST</p>
                                    <a href="tel:+911234567890" className="text-accent hover:underline">
                                        +91 123 456 7890
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="text-accent" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">Office</h3>
                                    <p className="text-muted text-sm">
                                        123 Business Park<br />
                                        Bangalore, Karnataka 560001<br />
                                        India
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <Link href="/help-center" className="block text-accent hover:underline text-sm">
                                    → Help Center & FAQs
                                </Link>
                                <Link href="/terms" className="block text-accent hover:underline text-sm">
                                    → Terms of Service
                                </Link>
                                <Link href="/privacy" className="block text-accent hover:underline text-sm">
                                    → Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
