'use client';

import React from 'react';
import Image from 'next/image';
import { designTokensV2 } from '../../theme/design-tokens-v2';
import { Star } from 'lucide-react';

export interface ServiceCardProps {
    service: {
        id: string;
        name: string;
        image: string;
        price: number;
        rating: number;
        reviews: number;
        isBestMatch?: boolean;
    };
    onClick: (id: string) => void;
    className?: string; // Keep for compatibility
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
    return (
        <div
            onClick={() => onClick(service.id)}
            className="bg-white rounded-v2-card shadow-v2-card overflow-hidden flex flex-col cursor-pointer transition-transform active:scale-[0.98] hover:shadow-v2-floating duration-300"
            style={{
                width: '100%',
                minWidth: designTokensV2.dimensions.serviceCard.width,
                height: designTokensV2.dimensions.serviceCard.height,
            }}
        >
            {/* Image Section */}
            <div className="relative h-[120px] bg-gray-200">
                <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />

                {/* Best Match Badge (Provider Blind) */}
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
                    <span className="text-[10px] font-bold text-v2-text-primary uppercase tracking-wide">Best Match</span>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-3 flex flex-col flex-1 justify-between bg-white relative">
                <div>
                    <h3 className="font-semibold text-v2-text-primary text-[15px] leading-tight mb-1 line-clamp-2">
                        {service.name}
                    </h3>
                    <div className="flex items-center gap-1">
                        <Star size={12} className="text-v2-accent-warning fill-current" />
                        <span className="text-xs font-medium text-v2-text-secondary">
                            {service.rating} ({service.reviews}+)
                        </span>
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-bold text-v2-text-primary">
                        {service.price ? `From ₹${service.price}` : 'Price on Request'}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-v2-bg flex items-center justify-center text-v2-text-primary hover:bg-v2-text-primary hover:text-white transition-colors duration-200">
                        <span className="text-lg leading-none -mt-0.5">+</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
