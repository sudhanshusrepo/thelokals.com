'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

interface ProviderLandingProps {
    onRegisterClick: () => void;
}

export const ProviderLanding: React.FC<ProviderLandingProps> = ({ onRegisterClick }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const features = [
        {
            icon: '💰',
            title: 'Earn More',
            description: 'Set your own rates and keep 85% of your earnings. No hidden fees.'
        },
        {
            icon: '📱',
            title: 'Easy to Use',
            description: 'Simple app interface to manage bookings, payments, and customer communication.'
        },
        {
            icon: '🎯',
            title: 'AI-Powered Matching',
            description: 'Get matched with customers near you based on your skills and availability.'
        },
        {
            icon: '⭐',
            title: 'Build Your Reputation',
            description: 'Earn ratings and reviews to grow your business and attract more customers.'
        },
        {
            icon: '🔔',
            title: 'Real-Time Notifications',
            description: 'Never miss a booking request with instant push notifications.'
        },
        {
            icon: '📊',
            title: 'Track Your Growth',
            description: 'Monitor your earnings, bookings, and performance with detailed analytics.'
        }
    ];

    const benefits = [
        'Flexible working hours - work when you want',
        'Weekly payouts directly to your bank account',
        'Free training and support to help you succeed',
        'Insurance coverage for all jobs',
        'Access to exclusive offers and promotions',
        'Growing customer base across your city'
    ];

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            role: 'Plumber',
            image: '👨‍🔧',
            rating: 5,
            text: 'I\'ve doubled my income since joining thelokals. The app makes it so easy to manage my bookings!'
        },
        {
            name: 'Priya Sharma',
            role: 'Electrician',
            image: '👩‍🔧',
            rating: 5,
            text: 'Best decision I made for my business. Customers find me easily and payments are always on time.'
        },
        {
            name: 'Mohammed Ali',
            role: 'Carpenter',
            image: '👨‍🏭',
            rating: 5,
            text: 'The AI matching is amazing! I get jobs that perfectly match my skills and location.'
        }
    ];

    const handleGetStarted = () => {
        if (user) {
            onRegisterClick();
        } else {
            router.push('/auth');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="fixed top-0 left-0 bg-black text-white p-2 text-xs z-50">
                DEBUG: User={user ? 'Yes' : 'No'} | Modal={showAuthModal ? 'On' : 'Off'}
            </div>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-amber-200/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            Grow Your Business with
                            <span className="block text-primary mt-2">thelokals</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Join thousands of service providers earning more by connecting with customers in your area
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                            >
                                {user ? 'Complete Registration' : 'Get Started'}
                            </button>
                            <a
                                href="#how-it-works"
                                className="px-8 py-4 bg-white text-primary text-lg font-bold rounded-xl hover:bg-blue-50 transition-all border-2 border-blue-100"
                            >
                                Learn More
                            </a>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-green-500">✓</span>
                                <span>Free to Join</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-green-500">✓</span>
                                <span>85% Earnings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-green-500">✓</span>
                                <span>Weekly Payouts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-primary text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">10,000+</div>
                            <div className="text-blue-100">Active Providers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">50,000+</div>
                            <div className="text-blue-100">Jobs Completed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">₹2.5Cr+</div>
                            <div className="text-blue-100">Earnings Paid</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">4.8★</div>
                            <div className="text-blue-100">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
                        Why Choose thelokals?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 hover:border-blue-200"
                            >
                                <div className="text-5xl mb-4 bg-blue-50 w-20 h-20 flex items-center justify-center rounded-2xl">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-slate-50" id="how-it-works">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '1', title: 'Sign Up', desc: 'Create your account in minutes', icon: '📱' },
                            { step: '2', title: 'Complete Profile', desc: 'Add your skills and documents', icon: '📝' },
                            { step: '3', title: 'Get Verified', desc: 'Quick verification process', icon: '✅' },
                            { step: '4', title: 'Start Earning', desc: 'Accept jobs and grow your business', icon: '💰' }
                        ].map((item, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-6 inline-block">
                                    <div className="w-20 h-20 bg-white border-2 border-blue-100 text-primary rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-sm group-hover:border-primary transition-colors">
                                        {item.step}
                                    </div>
                                    <div className="text-4xl absolute -bottom-2 -right-2 bg-blue-50 rounded-full p-1 border-2 border-white">{item.icon}</div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
                        Provider Benefits
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-3 bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 hover:bg-blue-50 transition-colors">
                                <span className="text-2xl text-primary">✓</span>
                                <span className="text-slate-700 font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
                        What Our Providers Say
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-5xl bg-slate-50 rounded-full p-2">{testimonial.image}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                                        <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <span key={i} className="text-amber-400">★</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
                        Ready to Grow Your Business?
                    </h2>
                    <p className="text-xl mb-10 text-slate-400">
                        Join thelokals today and start earning more with flexible working hours
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
                    >
                        {user ? 'Complete Registration' : 'Register as Provider'}
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="font-bold text-2xl mb-4">thelokals<span className="text-primary">.com</span></div>
                    <p className="text-slate-500 mb-8">© 2025 thelokals. All rights reserved.</p>
                    <div className="flex justify-center gap-8 text-sm font-medium">
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
