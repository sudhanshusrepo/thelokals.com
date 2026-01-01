'use client';

import React, { Suspense } from 'react';
import BrowseContent from './BrowseContent';

export default function BrowsePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Loading services...</p>
            </div>
        }>
            <BrowseContent />
        </Suspense>
    );
}
