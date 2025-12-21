import React from 'react';
import { BenefitCard, BenefitCardProps } from './BenefitCard';

interface BenefitsSectionProps {
    title?: string;
    subtitle?: string;
    benefits?: BenefitCardProps[];
}

const DEFAULT_BENEFITS: BenefitCardProps[] = [
    {
        title: "Verified Professionals",
        description: "Every provider is vetted, background-checked, and trained for quality.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        title: "Transparent Pricing",
        description: "Upfront quotes without hidden fees. Pay only after the job is done.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        title: "Satisfaction Guarantee",
        description: "If you aren't happy with the service, we will make it right.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({
    title = "Why TheLokals?",
    subtitle = "Experience the best in home services.",
    benefits = DEFAULT_BENEFITS
}) => {
    return (
        <section className="py-12 bg-slate-50 w-full overflow-hidden">
            <div className="max-w-md mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">{title}</h2>
                    <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
                </div>

                <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                        <BenefitCard
                            key={index}
                            {...benefit}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
