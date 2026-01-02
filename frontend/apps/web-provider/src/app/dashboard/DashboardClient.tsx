'use client';

import React from 'react';
import { ProviderDashboard } from '../../components/ProviderDashboard';

export default function DashboardClient() {
    return (
        <div className="min-h-screen bg-slate-50">
            <ProviderDashboard />
        </div>
    );
}
