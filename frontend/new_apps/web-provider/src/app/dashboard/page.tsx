'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useDashboardData } from '../../hooks/useDashboardData';
import Link from 'next/link';
import { HeroCard } from '../../components/v2/HeroCard';
import { QuickStats } from '../../components/v2/QuickStats';
import { JobCard } from '../../components/v2/JobCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { IdentityBanner } from '../../components/v2/IdentityBanner';

export default function Dashboard() {
    const { profile, user } = useAuth();
    const { recentJobs, stats, loading, error } = useDashboardData(user?.id);

    if (error) {
        // Simple error state for now, toast handled by service if applicable or we can useEffect to toast here.
        // For dashboard partial loads are acceptable.
    }

    // Check verification status (assuming is_verified or isVerified exists on profile)
    // Coalesce boolean just in case
    const isVerified = (profile as any)?.is_verified || (profile as any)?.isVerified;

    return (
        <ProviderLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Hello, {profile?.full_name?.split(' ')[0] || 'Partner'} 👋
                    </h1>
                    <p className="text-neutral-500 text-sm">Let's make today productive.</p>
                </div>
                <div className="hidden md:block">
                    <span className="bg-brand-green/10 text-brand-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Online
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Identity Banner */}
                    {!isVerified && (
                        <div className="mb-6">
                            <IdentityBanner />
                        </div>
                    )}

                    {/* Hero Section */}
                    <div className="mb-8">
                        <HeroCard monthlyEarnings={stats.monthlyEarnings} percentageChange={stats.trend} />
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-8">
                        <QuickStats
                            activeJobs={stats.activeJobs}
                            completedToday={stats.completedToday}
                            rating={stats.rating}
                        />
                    </div>

                    {/* Active Jobs */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-neutral-900">Active Jobs ({recentJobs.length})</h2>
                            <Link href="/jobs" className="text-sm font-semibold text-brand-green hover:underline">
                                View All
                            </Link>
                        </div>

                        {recentJobs.length === 0 ? (
                            <div className="bg-white rounded-card p-8 text-center border border-neutral-100">
                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">😴</span>
                                </div>
                                <h3 className="text-neutral-900 font-bold mb-1">No active jobs</h3>
                                <p className="text-neutral-500 text-sm">You're all caught up! Enable notifications to get new requests.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </ProviderLayout>
    );
}
