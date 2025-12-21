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
        <section className="py-12 md:py-16 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10">
            <div className="max-w-7xl mx-auto px-4">
                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Why Choose lokals?
                    </h2>
                    <p className="text-muted text-base md:text-lg max-w-2xl mx-auto">
                        Local experts, transparent pricing and instant help whenever you need it.
                    </p>
                </div>

                {/* Benefit Cards */}
                <div className="space-y-4 max-w-3xl mx-auto">
                    {benefits.map((benefit, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-start gap-4 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-lg mb-1">
                                    {benefit.title}
                                </h3>
                                <p className="text-muted text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
