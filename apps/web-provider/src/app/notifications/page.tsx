'use client';

import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <ProviderLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
                    <p className="text-neutral-500">Stay updated with your latest activities.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-4">
                    <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">No new notifications</h3>
                <p className="text-neutral-500 max-w-sm">
                    You're all caught up! We'll notify you when you receive new jobs or updates.
                </p>
            </div>
        </ProviderLayout>
    );
}
