'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type ServiceVariant = 'basic' | 'med' | 'full';

interface ServiceCardProps {
    variant: ServiceVariant;
    serviceName: string;
    description: string;
    icon?: string;
    imageUrl?: string;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

const variantConfig = {
    basic: {
        price: 350,
        label: 'Basic',
        color: 'from-neutral-100 to-neutral-200',
        borderColor: 'border-neutral-300',
        textColor: 'text-neutral-900',
        badge: 'bg-neutral-200 text-neutral-700',
    },
    med: {
        price: 550,
        label: 'Medium',
        color: 'from-primary-light to-primary',
        borderColor: 'border-primary',
        textColor: 'text-secondary',
        badge: 'bg-primary/20 text-primary-foreground',
    },
    full: {
        price: 850,
        label: 'Full Service',
        color: 'from-accent-amber to-warning',
        borderColor: 'border-accent-amber',
        textColor: 'text-secondary',
        badge: 'bg-accent-amber/20 text-secondary',
    },
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
    variant,
    serviceName,
    description,
    icon,
    imageUrl,
    isSelected = false,
    onClick,
    className = '',
}) => {
    const config = variantConfig[variant];

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl cursor-pointer
                transition-all duration-300
                ${isSelected
                    ? `ring-4 ring-accent-amber shadow-elevated`
                    : 'shadow-lg hover:shadow-xl'
                }
                ${className}
            `}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />

            {/* Glow Effect when selected */}
            {isSelected && (
                <div className="absolute inset-0 bg-accent-amber/20 animate-pulse-slow" />
            )}

            {/* Content */}
            <div className="relative p-6 bg-surface/90 backdrop-blur-sm border-2 ${config.borderColor} rounded-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="text-3xl">{icon}</div>
                        )}
                        {imageUrl && !icon && (
                            <img
                                src={imageUrl}
                                alt={serviceName}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h3 className={`font-bold text-lg ${config.textColor}`}>
                                {serviceName}
                            </h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
                                {config.label}
                            </span>
                        </div>
                    </div>

                    {/* Price Badge */}
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-foreground">
                            ₹{config.price}
                        </span>
                        <span className="text-xs text-muted">per service</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted leading-relaxed mb-4">
                    {description}
                </p>

                {/* Features indicator */}
                <div className="flex items-center gap-2">
                    {variant === 'basic' && (
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-neutral-400" />
                            <div className="w-2 h-2 rounded-full bg-neutral-300" />
                            <div className="w-2 h-2 rounded-full bg-neutral-200" />
                        </div>
                    )}
                    {variant === 'med' && (
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-2 h-2 rounded-full bg-neutral-300" />
                        </div>
                    )}
                    {variant === 'full' && (
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-accent-amber" />
                            <div className="w-2 h-2 rounded-full bg-accent-amber" />
                            <div className="w-2 h-2 rounded-full bg-accent-amber" />
                        </div>
                    )}
                    <span className="text-xs text-muted ml-1">
                        {variant === 'basic' && 'Essential service'}
                        {variant === 'med' && 'Standard + extras'}
                        {variant === 'full' && 'Complete package'}
                    </span>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-accent-amber rounded-full flex items-center justify-center shadow-lg"
                    >
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
