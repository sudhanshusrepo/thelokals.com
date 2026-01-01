'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Loading skeleton components
const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>
);

// Lazy-loaded home sections (below-the-fold)
export const LazyBrowseServices = dynamic(
    () => import('./home/BrowseServices'),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true, // SEO-friendly sections should be SSR
    }
);

export const LazyWhyLokals = dynamic(
    () => import('./home/WhyLokals'),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true,
    }
);

export const LazyFooter = dynamic(
    () => import('./home/Footer'),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true,
    }
);
