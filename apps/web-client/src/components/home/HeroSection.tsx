'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative h-auto md:h-[320px] w-full overflow-hidden rounded-b-3xl md:rounded-3xl bg-black aspect-[4/3] md:aspect-auto">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent z-10" />
            <img
                src="https://images.unsplash.com/photo-1581578731117-104f2a8d275d?q=80&w=1920&auto=format&fit=crop"
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-12 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-lokals-yellow uppercase tracking-wider mb-3 md:mb-4 inline-block">
                        Instant Booking
                    </span>
                    <h1 className="text-2xl min-[360px]:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight">
                        Expert Help,<br /> Arriving Instantly.
                    </h1>
                    <p className="text-white/80 mb-6 md:mb-8 max-w-sm text-sm md:text-base">
                        From cleaning to repairs, get trusted professionals at your doorstep in minutes.
                    </p>
                    <button className="px-5 py-2.5 md:px-6 md:py-3 bg-lokals-green text-black font-bold rounded-xl flex items-center gap-2 hover:bg-green-400 transition-colors active:scale-95 text-xs md:text-base w-fit">
                        Explore Services <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
