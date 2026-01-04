'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { Wallet, Briefcase, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { bookingService } from '@thelocals/core/services/bookingService';
import { Booking } from '@thelocals/core/types';
import Link from 'next/link';

export default function Dashboard() {
    const { profile, user } = useAuth();
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        jobsCompleted: 0,
        rating: 4.8,
        completionRate: 98
    });

    useEffect(() => {
        if (user?.id) {
            loadDashboardData(user.id);
        }
    }, [user]);

    const loadDashboardData = async (userId: string) => {
        try {
            const [bookings, providerStats] = await Promise.all([
                bookingService.getWorkerBookings(userId),
                bookingService.getProviderStats(userId)
            ]);
            setRecentBookings(bookings.slice(0, 5)); // Top 5
            setStats(providerStats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: Wallet, color: 'bg-green-100 text-green-600' },
        { label: 'Jobs Completed', value: stats.jobsCompleted.toString(), icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
        { label: 'Rating', value: stats.rating.toString(), icon: Star, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <ProviderLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Partner'}!</h1>
                <p className="text-neutral-500">Here's what's happening with your business today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statsData.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                        <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">Recent Jobs</h3>
                    <Link href="/jobs" className="text-sm text-primary font-medium hover:underline">View All</Link>
                </div>
                <div className="divide-y divide-neutral-100">
                    {loading ? (
                        <div className="p-8 text-center text-neutral-500">Loading jobs...</div>
                    ) : recentBookings.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">No recent jobs found.</div>
                    ) : (
                        recentBookings.map((booking) => (
                            <div key={booking.id} className="p-4 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-neutral-900">{booking.service_category || 'Service Request'}</p>
                                    <p className="text-xs text-neutral-500">
                                        {new Date(booking.created_at).toLocaleDateString()} • {booking.status}
                                    </p>
                                </div>
                                <span className="font-bold text-neutral-900">₹{booking.final_cost || booking.estimated_cost || 0}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ProviderLayout>
    );
}
