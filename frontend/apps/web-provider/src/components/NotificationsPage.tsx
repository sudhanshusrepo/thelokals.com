import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { realtimeService, ProviderNotification } from '../services/realtime';

interface Notification extends ProviderNotification {
    createdAt: Date;
    actionUrl?: string;
}

const NotificationsPage: React.FC = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'booking_request' | 'payment'>('all');
    const [providerId, setProviderId] = useState<string | null>(null);

    useEffect(() => {
        const initNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setProviderId(user.id);

            // Fetch initial
            const data = await realtimeService.getNotifications(user.id);
            const mapped = data.map(n => ({
                ...n,
                createdAt: new Date(n.created_at),
                actionUrl: n.action_url
            }));
            setNotifications(mapped);

            // Subscribe
            const unsubscribe = realtimeService.subscribeToNotifications(
                user.id,
                (newNotif) => {
                    setNotifications(prev => [{
                        ...newNotif,
                        createdAt: new Date(newNotif.created_at),
                        actionUrl: newNotif.action_url
                    }, ...prev]);
                },
                (updatedNotif) => {
                    setNotifications(prev => prev.map(n =>
                        n.id === updatedNotif.id ? {
                            ...updatedNotif,
                            createdAt: new Date(updatedNotif.created_at),
                            actionUrl: updatedNotif.action_url
                        } : n
                    ));
                }
            );

            return () => {
                unsubscribe();
            };
        };

        const cleanup = initNotifications();
        return () => {
            cleanup.then(unsub => unsub && unsub());
        };
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        await realtimeService.markAsRead(id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (providerId) {
            await realtimeService.markAllAsRead(providerId);
        }
    };

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await realtimeService.deleteNotification(id);
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking_request': return '📋';
            case 'booking_update': return '🔔';
            case 'payment': return '💰';
            case 'system': return '⚙️';
            case 'promotion': return '🎁';
            default: return '📢';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'booking_request': return 'bg-blue-50 border-blue-200';
            case 'booking_update': return 'bg-purple-50 border-purple-200';
            case 'payment': return 'bg-green-50 border-green-200';
            case 'system': return 'bg-slate-50 border-slate-200';
            case 'promotion': return 'bg-amber-50 border-amber-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    const getTimeAgo = (date: Date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
                    <p className="text-slate-600">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-primary font-semibold hover:bg-blue-50 rounded-lg transition-all"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: 'Unread' },
                    { key: 'booking_request', label: 'Bookings' },
                    { key: 'payment', label: 'Payments' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key as any)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === key
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {label}
                        {key === 'unread' && unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="text-6xl mb-4">🔔</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications</h3>
                    <p className="text-slate-600">
                        {filter === 'unread'
                            ? 'You\'re all caught up!'
                            : 'New notifications will appear here'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`relative bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${getNotificationColor(notification.type)
                                } ${!notification.read ? 'border-l-4' : ''}`}
                        >
                            <div
                                onClick={() => handleNotificationClick(notification)}
                                className="p-4 cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className={`font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="flex-shrink-0 h-2 w-2 bg-primary rounded-full"></span>
                                            )}
                                        </div>
                                        <p className={`text-sm mb-2 ${!notification.read ? 'text-slate-700' : 'text-slate-600'}`}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">{getTimeAgo(notification.createdAt)}</span>
                                            {notification.actionUrl && (
                                                <span className="text-xs text-primary font-semibold">
                                                    View Details →
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex border-t border-slate-100">
                                {!notification.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                        className="flex-1 px-4 py-2 text-sm text-primary font-semibold hover:bg-blue-50 transition-colors"
                                    >
                                        Mark as read
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors border-l border-slate-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Notification Settings</h2>
                <div className="space-y-3">
                    {[
                        { label: 'Push Notifications', description: 'Receive push notifications for new bookings' },
                        { label: 'Email Notifications', description: 'Get email updates for important events' },
                        { label: 'SMS Alerts', description: 'Receive SMS for urgent booking requests' },
                        { label: 'Promotional Offers', description: 'Get notified about special offers and bonuses' }
                    ].map((setting, index) => (
                        <label key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">{setting.label}</p>
                                <p className="text-sm text-slate-600">{setting.description}</p>
                            </div>
                            <input
                                type="checkbox"
                                defaultChecked={true}
                                className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { NotificationsPage };
export default NotificationsPage;
