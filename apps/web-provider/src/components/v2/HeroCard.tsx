
'use client';

import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HeroCardProps {
    monthlyEarnings: number;
    percentageChange: number;
}

export const HeroCard = ({ monthlyEarnings, percentageChange }: HeroCardProps) => {
    return (
        <div className="w-full h-auto md:h-60 bg-brand-gradient-vertical md:bg-brand-gradient rounded-hero p-6 md:p-8 text-brand-text shadow-hero relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]">
            <div className="relative z-10">
                <p className="text-sm md:text-base font-medium opacity-80 mb-2">December earnings</p>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">₹{monthlyEarnings.toLocaleString()}</h2>

                <div className="flex items-center gap-2 mb-6 md:mb-8">
                    <div className="bg-white/30 backdrop-blur-sm p-1 rounded-full">
                        <TrendingUp size={16} className="text-neutral-900" />
                    </div>
                    <span className="font-bold text-sm md:text-base">+{percentageChange}% from last month</span>
                </div>

                <Link href="/earnings" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors">
                    View detailed analytics <ArrowRight size={16} />
                </Link>
            </div>

            {/* Decorative Overlay */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-brand-yellow/30 rounded-full blur-2xl" />
        </div>
    );
};
