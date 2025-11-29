import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const HomeSkeleton = () => (
    <div className="space-y-6 animate-fade-in-up">
        {/* Category Grid Skeleton */}
        <div className="mx-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-6 sm:p-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl">
                        <Skeleton circle height={64} width={64} className="mb-3" />
                        <Skeleton height={20} width="80%" className="mb-2" />
                        <Skeleton height={14} width="90%" className="hidden sm:block" />
                    </div>
                ))}
            </div>
        </div>

        {/* Subtitle Skeleton */}
        <div className="text-center py-4">
            <Skeleton height={16} width={300} className="mx-auto" />
        </div>
    </div>
);

export const SearchResultsSkeleton = () => (
    <div className="animate-fade-in">
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={40} width={100} className="rounded-full" />
            ))}
        </div>
        <Skeleton height={20} width={150} className="my-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                    <Skeleton height={160} />
                    <div className="p-4">
                        <Skeleton height={24} width="70%" />
                        <Skeleton height={16} width="40%" className="mt-2" />
                        <Skeleton height={16} width="90%" className="mt-4" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const BookingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex items-center space-x-4">
                    <Skeleton circle height={50} width={50} />
                    <div className="flex-grow">
                        <Skeleton height={20} width="60%" />
                        <Skeleton height={16} width="40%" className="mt-2" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center space-x-4">
            <Skeleton circle height={80} width={80} />
            <div className="flex-grow">
                <Skeleton height={28} width="50%" />
                <Skeleton height={20} width="70%" className="mt-2" />
            </div>
        </div>
        <div className="space-y-4">
            <Skeleton height={40} count={3} />
        </div>
    </div>
);
