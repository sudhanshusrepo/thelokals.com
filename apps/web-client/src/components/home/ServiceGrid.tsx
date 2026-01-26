'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ServiceCategory } from '@thelocals/platform-core';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface ServiceGridProps {
    categories: ServiceCategory[];
}

export function ServiceGrid({ categories }: ServiceGridProps) {
    if (!categories.length) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
                <Link href={`/services/${cat.id}`} key={cat.id}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-card transition-shadow bg-white"
                    >
                        {/* Image */}
                        <div className="absolute inset-0 bg-gray-200">
                            <img
                                src={`https://source.unsplash.com/random/400x600?${cat.name}`}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-white/80">
                                <span className="flex items-center gap-1">
                                    <Star size={10} className="fill-lokals-yellow text-lokals-yellow" /> 4.8
                                </span>
                                <span>•</span>
                                <span>Starts ₹{cat.base_price || 499}</span>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}
