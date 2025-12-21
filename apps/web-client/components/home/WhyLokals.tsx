'use client';

import React from 'react';

interface Benefit {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const benefits: Benefit[] = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Verified & Nearby',
        description: 'Providers vetted with KYC, reviews and response-time SLAs.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'AI-Smart Matching',
        description: 'Get the right pro in under 60 seconds based on your issue and location.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Upfront Pricing',
        description: 'Clear estimates before booking; no hidden charges.'
    }
];

export const WhyLokals: React.FC = () => {
    return (
        <section className="py-16 md:py-20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
            <div className="max-w-7xl mx-auto px-4">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                        Why Choose lokals?
                    </h2>
                    <p className="text-muted text-base md:text-lg max-w-2xl mx-auto">
                        Local experts, transparent pricing and instant help whenever you need it.
                    </p>
                </div>

                {/* Benefit Cards - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {benefits.map((benefit, idx) => (
                        <div
                            key={idx}
                            className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 hover:border-accent/20"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-accent mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                {benefit.icon}
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="font-bold text-primary text-xl mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-muted text-sm md:text-base leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>

                            {/* Decorative Element */}
                            <div className="mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                                    <span>Learn more</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
