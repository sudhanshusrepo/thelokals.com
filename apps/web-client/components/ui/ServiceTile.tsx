'use client';

import React from 'react';
import Image from 'next/image';

interface ServiceTileProps {
    icon?: React.ReactNode;
    emoji?: string;
    imageUrl?: string;
    label: string;
    onClick?: () => void;
    variant?: 'default' | 'category' | 'browse';
    className?: string;
    'data-testid'?: string;
}

/**
 * ServiceTile Component
 * 
 * Reusable service tile with 3D aesthetic and premium feel.
 * 
 * Features:
 * - Elevation shadow using S1 (navy) at low opacity
 * - Light neutral background (N050)
 * - P1 (green) accent strip for 3D effect
 * - Press-in animation on click (scale 0.98, 150-200ms)
 * - Smooth hover transitions
 * 
 * Variants:
 * - default: Standard tile for general use
 * - category: Optimized for category chips (smaller, square)
 * - browse: Larger tiles for browse services grid
 */
export function ServiceTile({
    icon,
    emoji,
    imageUrl,
    label,
    onClick,
    variant = 'default',
    className = '',
    'data-testid': testId,
}: ServiceTileProps) {
    const baseClasses = 'group relative overflow-hidden bg-neutral-50 transition-all duration-200 active:scale-[0.98] hover:-translate-y-1';

    const variantClasses = {
        default: 'w-20 h-20 rounded-2xl',
        category: 'w-20 h-20 rounded-2xl',
        browse: 'w-full h-56 md:h-64 rounded-3xl',
    };

    const shadowClasses = 'shadow-elevated hover:shadow-xl';

    return (
        <button
            onClick={onClick}
            data-testid={testId}
            className={`${baseClasses} ${variantClasses[variant]} ${shadowClasses} ${className}`}
            aria-label={label}
        >
            {/* P1 Accent Strip (top edge for 3D effect) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Content Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                {/* Icon/Emoji/Image */}
                {imageUrl ? (
                    <div className="absolute inset-0">
                        <Image
                            src={imageUrl}
                            alt={label}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 20vw"
                        />
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ) : emoji ? (
                    <div className="text-3xl mb-2 transition-transform duration-200 group-hover:scale-110">
                        {emoji}
                    </div>
                ) : icon ? (
                    <div className="text-secondary mb-2 transition-transform duration-200 group-hover:scale-110">
                        {icon}
                    </div>
                ) : null}

                {/* Label */}
                {variant === 'browse' && imageUrl ? (
                    // For browse variant with image, position label at bottom
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-lg md:text-xl leading-tight drop-shadow-md">
                            {label}
                        </h3>
                    </div>
                ) : (
                    // For category/default variants, center the label
                    <span className={`text-xs font-semibold text-foreground text-center leading-tight transition-colors ${imageUrl ? 'relative z-10 text-white' : 'group-hover:text-primary'
                        }`}>
                        {label}
                    </span>
                )}
            </div>

            {/* Subtle gradient background for depth (when no image) */}
            {!imageUrl && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </button>
    );
}
