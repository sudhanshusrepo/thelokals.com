'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, ArrowRight, Shield, Wallet, Users } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    React.useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);



    if (loading) return null; // Or a loading spinner

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-neutral-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                        <span className="font-bold text-xl text-neutral-900">lokals partner</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/login')}
                            className="text-neutral-700 font-medium hover:text-neutral-900 px-4 py-2 whitespace-nowrap"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-primary text-white font-bold px-6 py-2.5 rounded-full hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
                        >
                            Join Now
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 tracking-tight mb-8">
                        Grow your business with <span className="text-primary">lokals</span>
                    </h1>
                    <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
                        Connect with thousands of customers in your area. Manage bookings, track earnings, and build your reputation—all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full sm:w-auto bg-neutral-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            Get Started <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Stats */}
            <section className="bg-neutral-50 py-20 px-4 sm:px-6 lg:px-8 border-y border-neutral-200">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Wallet size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-4">Performance-Based Earnings</h3>
                        <p className="text-neutral-600 text-sm">
                            Fair commission rates based on your service quality.
                        </p>
                        <div className="mt-4 text-left text-xs text-neutral-500 space-y-1 bg-neutral-50 p-3 rounded-lg">
                            <div className="flex justify-between"><span>⭐ 4.5+</span> <span className="font-bold text-green-600">12%</span></div>
                            <div className="flex justify-between"><span>⭐ 4.0-4.4</span> <span className="font-bold text-neutral-700">15%</span></div>
                            <div className="flex justify-between"><span>⭐ 3.0-3.9</span> <span className="font-bold text-orange-600">20%</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center">
                        <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-4">Verified Customers</h3>
                        <p className="text-neutral-600">Work with trusted local customers. We verify every booking request.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center">
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-4">Secure Payments</h3>
                        <p className="text-neutral-600">Get paid directly to your bank account instantly upon job completion.</p>
                    </div>
                </div>
            </section>

            {/* Requirements */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">Who can join?</h2>
                <div className="space-y-4">
                    {[
                        "Professional service providers (Electricians, Plumbers, Cleaners, etc.)",
                        "Must have valid government ID and trade licenses",
                        "Own necessary tools and equipment",
                        "Smartphone with active internet connection"
                    ].map((req, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-sm">
                            <CheckCircle className="text-green-600 flex-shrink-0" />
                            <span className="font-medium text-neutral-800">{req}</span>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="py-8 text-center text-neutral-500 text-sm">
                © {new Date().getFullYear()} Lokals Partner. All rights reserved.
            </footer>
        </div>
    );
}
