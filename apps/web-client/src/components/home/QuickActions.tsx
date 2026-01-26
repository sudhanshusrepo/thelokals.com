'use client';

import React from 'react';
import { ServiceCategory } from '@thelocals/platform-core';

interface QuickActionsProps {
    categories: ServiceCategory[];
}

export function QuickActions({ categories }: QuickActionsProps) {
    return (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 -mx-4 md:mx-0 px-4 mb-6 no-scrollbar overflow-x-auto">
            <div className="flex gap-3">
                {categories.slice(0, 6).map(cat => (
                    <button
                        key={cat.id}
                        className="px-5 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 whitespace-nowrap hover:border-lokals-green hover:bg-green-50 hover:text-lokals-green transition-colors"
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
