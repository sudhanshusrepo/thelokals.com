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

const ChatInputSkeleton = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-3 sm:p-4 pb-safe z-40">
        <div className="max-w-3xl mx-auto flex items-end gap-2 sm:gap-3">
            <div className="flex-1 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        </div>
    </div>
);

const OverlaySkeleton = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
    </div>
);

// Lazy-loaded components with custom loading states
export const LazyChatInput = dynamic(
    () => import('./ChatInput').then(mod => ({ default: mod.ChatInput })),
    {
        loading: () => <ChatInputSkeleton />,
        ssr: false, // Chat input requires client-side media APIs
    }
);

export const LazyAIAnalysisOverlay = dynamic(
    () => import('./AIAnalysisOverlay').then(mod => ({ default: mod.AIAnalysisOverlay })),
    {
        loading: () => <OverlaySkeleton />,
        ssr: false,
    }
);

// Lazy-loaded home sections (below-the-fold)
export const LazyBrowseServices = dynamic(
    () => import('./home/BrowseServices').then(mod => ({ default: mod.BrowseServices })),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true, // SEO-friendly sections should be SSR
    }
);

export const LazyWhyLokals = dynamic(
    () => import('./home/WhyLokals').then(mod => ({ default: mod.WhyLokals })),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true,
    }
);

export const LazyFooter = dynamic(
    () => import('./home/Footer').then(mod => ({ default: mod.Footer })),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true,
    }
);

// Features component (used in service pages)
export const LazyFeatures = dynamic(
    () => import('./Features').then(mod => ({ default: mod.Features })),
    {
        loading: () => <LoadingSkeleton />,
        ssr: true,
    }
);

// Service grid (heavy component with many cards)
export const LazyServiceGrid = dynamic(
    () => import('./ServiceGrid'),
    {
        loading: () => (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                ))}
            </div>
        ),
        ssr: true,
    }
);
