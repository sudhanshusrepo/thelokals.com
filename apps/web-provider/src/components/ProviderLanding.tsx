'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { LANDING_CONTENT } from '../constants/landing-content';

interface ProviderLandingProps {
    onRegisterClick: () => void;
}

export const ProviderLanding: React.FC<ProviderLandingProps> = ({ onRegisterClick }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user, profile } = useAuth();
    const router = useRouter();



    const handleGetStarted = () => {
        if (user) {
            if (profile?.verification_status === 'pending') {
                router.push('/verification-pending');
            } else if (profile?.verification_status === 'approved') {
                router.push('/dashboard');
            } else if (profile?.verification_status === 'rejected') {
                router.push('/verification-pending'); // Show rejection screen
            } else {
                onRegisterClick(); // Incomplete registration
            }
        } else {
            router.push('/auth');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent/20 to-primary">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-fade-in-up">
                            <span className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent font-semibold text-sm border border-accent/20 backdrop-blur-sm">
                                {LANDING_CONTENT.hero.badge}
                            </span>
                            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                                {LANDING_CONTENT.hero.title} <span className="text-accent">{LANDING_CONTENT.hero.highlight}</span>
                            </h1>
                            <p className="text-xl text-slate-300 max-w-lg">
                                {LANDING_CONTENT.hero.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/auth/signup" className="px-8 py-4 bg-accent hover:opacity-90 text-white font-bold rounded-xl shadow-lg hover:shadow-accent/50 transition-all text-center">
                                    {LANDING_CONTENT.hero.cta.primary}
                                </Link>
                                <Link href="#how-it-works" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm border border-white/10 transition-all text-center">
                                    {LANDING_CONTENT.hero.cta.secondary}
                                </Link>
                            </div>

                            <div className="pt-8 border-t border-white/10 flex gap-8">
                                {LANDING_CONTENT.stats.map((stat, i) => (
                                    <div key={i}>
                                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                                        <p className="text-sm text-slate-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative animate-fade-in hidden lg:block">
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                {/* Simulated App UI - Dynamic Content */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">🔔</div>
                                        <div>
                                            <p className="text-white font-medium">{LANDING_CONTENT.hero.notification.title}</p>
                                            <p className="text-slate-400 text-sm">{LANDING_CONTENT.hero.notification.message}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4">
                                            <div className="flex justify-between mb-2">
                                                <div className="w-20 h-4 bg-slate-600/50 rounded"></div>
                                                <div className="w-12 h-4 bg-accent/20 rounded"></div>
                                            </div>
                                            <div className="w-3/4 h-3 bg-slate-600/30 rounded"></div>
                                        </div>
                                        <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 opacity-75">
                                            <div className="flex justify-between mb-2">
                                                <div className="w-20 h-4 bg-slate-600/50 rounded"></div>
                                                <div className="w-8 h-4 bg-blue-500/20 rounded"></div>
                                            </div>
                                            <div className="w-1/2 h-3 bg-slate-600/30 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-primary text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {LANDING_CONTENT.stats.map((stat, i) => (
                            <div key={i}>
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                <div className="text-blue-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
                        Why Choose {LANDING_CONTENT.hero.brandName}?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {LANDING_CONTENT.features.map((feature, index) => (
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
                        {LANDING_CONTENT.howItWorks.map((item, index) => (
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
                        {LANDING_CONTENT.providerBenefits.map((benefit, index) => (
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
                        {LANDING_CONTENT.testimonials.map((testimonial, index) => (
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
                        {LANDING_CONTENT.cta.title}
                    </h2>
                    <p className="text-xl mb-10 text-slate-400">
                        {LANDING_CONTENT.cta.subtitle}
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
                    >
                        {user ? LANDING_CONTENT.cta.buttonTextLoggedIn : LANDING_CONTENT.cta.buttonText}
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="font-bold text-2xl mb-4">lokals<span className="text-primary">.com</span></div>
                    <p className="text-slate-500 mb-8">{LANDING_CONTENT.footer.copyright}</p>
                    <div className="flex justify-center gap-8 text-sm font-medium">
                        {LANDING_CONTENT.footer.links.map((link, i) => (
                            <a key={i} href="#" className="text-slate-400 hover:text-primary transition-colors">{link}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};
