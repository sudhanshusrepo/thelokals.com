'use client';

import React from 'react';
import { Bell, Clock } from 'lucide-react';

export default function NotificationsPage() {
    const notifications = [
        { id: 1, title: 'Provider Arriving Soon', message: 'Your AC Repair expert is 10 mins away.', time: '10 mins ago', read: false },
        { id: 2, title: 'Booking Confirmed', message: 'Your booking for Deep Cleaning is confirmed.', time: '2 hours ago', read: true },
        { id: 3, title: 'Welcome to Lokals!', message: 'Thanks for joining. Get 10% off your first booking.', time: '1 day ago', read: true }
    ];

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
            <h1 className="text-2xl font-bold text-v2-text-primary mb-6">Notifications</h1>

            <div className="space-y-3">
                {notifications.map(notif => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-v2-card border flex gap-4 ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
                            }`}
                    >
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-v2-primary'
                            }`} />
                        <div>
                            <div className="font-bold text-gray-900 text-sm mb-1">{notif.title}</div>
                            <div className="text-sm text-gray-600 mb-2">{notif.message}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={12} />
                                {notif.time}
                            </div>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Bell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}
