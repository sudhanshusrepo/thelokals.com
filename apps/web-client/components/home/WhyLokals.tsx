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
        title: 'Verified Providers',
        description: 'Vetted professionals with KYC & background checks.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Transparent Pricing',
        description: 'Upfront quotes. No hidden charges or surprises.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        title: 'Fast Support',
        description: 'Instant help & dispute resolution for your peace of mind.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'Local Experts',
        description: 'Skilled pros from your neighborhood, ready to serve.'
    }
];

export const WhyLokals: React.FC = () => {
    return (
        <section className="py-12 md:py-16 bg-white border-t border-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                        Why neighbors choose <span className="text-primary">lokals</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-50 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                {benefit.icon}
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1.5">
                                {benefit.title}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 leading-snug max-w-[160px]">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
