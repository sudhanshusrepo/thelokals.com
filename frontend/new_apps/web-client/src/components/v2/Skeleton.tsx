import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', width, height, variant = 'rectangular' }: SkeletonProps) {
    const baseClass = "bg-neutral-200 animate-pulse";
    const variantClass = variant === 'circular' ? 'rounded-full' : 'rounded-lg';

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`}
            style={{ width, height }}
        />
    );
}

export function ServiceDetailSkeleton() {
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Skeleton */}
            <div className="relative h-[300px] w-full bg-neutral-200 animate-pulse" />

            <div className="px-6 -mt-8 relative z-10">
                {/* Title Card Skeleton */}
                <div className="bg-white rounded-v2-hero p-5 shadow-v2-card space-y-4">
                    <Skeleton height={32} width="80%" />
                    <Skeleton height={20} width="60%" />
                    <div className="flex justify-between items-end mt-4">
                        <Skeleton height={16} width={100} />
                        <Skeleton height={28} width={80} />
                    </div>
                </div>

                {/* Badge Skeleton */}
                <div className="mt-6">
                    <Skeleton height={80} width="100%" />
                </div>

                {/* List Skeleton */}
                <div className="mt-8 space-y-4">
                    <Skeleton height={24} width={150} />
                    <Skeleton height={20} width="100%" />
                    <Skeleton height={20} width="90%" />
                    <Skeleton height={20} width="85%" />
                </div>
            </div>
        </div>
    );
}
