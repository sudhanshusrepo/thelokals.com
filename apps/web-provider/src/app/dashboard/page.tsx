'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useDashboardData } from '../../hooks/useDashboardData';
import Link from 'next/link';
import { HeroCard } from '../../components/HeroCard';
import { QuickStats } from '../../components/QuickStats';
import { JobCard } from '../../components/jobs/JobCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { IdentityBanner } from '../../components/IdentityBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { JobDetailSheet } from '../../components/JobDetailSheet';
import { Booking } from "@thelocals/platform-core";
import { StatusToggle } from '../../components/StatusToggle';
import { useUserLocation } from '@thelocals/platform-core';
import { useGeoFilteredServices, liveBookingService, DbBookingRequest } from '@thelocals/platform-core';
import { BookingRequestModal } from '../../components/jobs/BookingRequestModal';

function DashboardLocationBanner() {
    const { location } = useUserLocation();
    const enabledServicesQuery = useGeoFilteredServices(location);
    const activeCount = enabledServicesQuery.filter((q: any) => q.data?.is_enabled).length;

    if (!location) return null;

    return (
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg text-white shadow-md">
            <h2 className="text-lg font-bold flex items-center gap-2">
                📍 Your Location: {location?.address || 'Detecting...'}
            </h2>
            <p className="text-sm opacity-90 mt-1">
                Pincode <b>{location?.pincode}</b> — {activeCount} services active in this area.
            </p>
        </div>
    );
}

export default function Dashboard() {
    const { profile, user } = useAuth();
    const { recentJobs, stats, loading, error, mutateActive } = useDashboardData(user?.id);
    const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Live Request State
    const [incomingRequest, setIncomingRequest] = useState<DbBookingRequest | null>(null);

    const handleJobClick = (job: Booking) => {
        setSelectedJob(job);
        setIsSheetOpen(true);
    };

    // Listen for new requests
    useEffect(() => {
        if (!user?.id) return;

        console.log("Subscribing to requests for provider:", user.id);
        const channel = liveBookingService.subscribeToProviderRequests(user.id, (payload) => {
            console.log("New Request Received:", payload);
            if (payload.eventType === 'INSERT') {
                // Fetch full details (optional, or rely on payload if rich enough. 
                // Payload is usually just the record. Ideally we fetch the booking details.)
                // For speed, let's just use what we have and maybe fetch extra async
                const req = payload.new as DbBookingRequest;

                // Quick fetch to get booking details to show in modal
                liveBookingService.getBookingById(req.booking_id).then(({ data }) => {
                    if (data) {
                        setIncomingRequest({ ...req, bookings: data } as any);
                    }
                });
            }
        });

        return () => {
            liveBookingService.unsubscribeFromChannel(channel);
        };
    }, [user?.id]);


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
                    <StatusToggle />
                </div>
            </div>

            {/* Location Banner (New Sprint 11) */}
            <DashboardLocationBanner />

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
                            <EmptyState
                                icon={Briefcase}
                                title="No active jobs"
                                description="You're all caught up! Requests will appear here."
                                action={{ label: 'Refresh', onClick: () => window.location.reload() }}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentJobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        booking={job}
                                        onClick={() => handleJobClick(job)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <JobDetailSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                job={selectedJob}
                onUpdate={() => {
                    mutateActive && mutateActive();
                    // window.location.reload(); // Removed to prevent full page refresh
                }}
            />

            {/* Incoming Request Modal */}
            {incomingRequest && (
                <BookingRequestModal
                    request={incomingRequest}
                    onClose={() => setIncomingRequest(null)}
                    onAccepted={() => {
                        setIncomingRequest(null);
                        mutateActive(); // Refresh execution list
                    }}
                />
            )}
        </ProviderLayout>
    );
}
