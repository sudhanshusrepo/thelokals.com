'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useEffect, useState } from 'react';
import { providerService, Booking, DbBookingRequest } from "@thelocals/platform-core";
import { JobCard } from '../../components/v2/JobCard';
import { toast } from 'react-hot-toast';
import { Loader2, Bell, Briefcase, CheckCircle } from 'lucide-react';
import { JobDetailSheet } from '../../components/v2/JobDetailSheet';

import { useJobsData } from '../../hooks/useJobsData';
import { EmptyState } from '../../components/ui/EmptyState';

export default function JobsPage() {
    const { user, profile, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('active');
    const [statusLoading, setStatusLoading] = useState(false);

    const { requests, activeJobs, historyJobs, isLoading: loading, mutateRequests, mutateActive } = useJobsData(user?.id, activeTab);

    // Combine data based on active tab for display
    const currentData = activeTab === 'requests' ? requests :
        activeTab === 'active' ? activeJobs : historyJobs;

    const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const isOnline = profile?.status === 'AVAILABLE' || profile?.status === 'BUSY';

    const handleToggleOnline = async () => {
        if (!user?.id) return;
        setStatusLoading(true);
        const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';
        try {
            await providerService.updateAvailability(user.id, newStatus);
            await refreshProfile();
            toast.success(newStatus === 'AVAILABLE' ? "You are now ONLINE" : "You are now OFFLINE");
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setStatusLoading(false);
        }
    };

    const refreshData = () => {
        mutateRequests();
        mutateActive();
        // Mutate history if needed, but usually less critical for immediate feedback
    };

    const handleAccept = async (requestId: string) => {
        if (!user?.id) return;
        try {
            toast.loading("Accepting job...");
            await providerService.acceptBooking(requestId, user.id);
            toast.dismiss();
            toast.success("Job Accepted! Check Active Jobs.");
            refreshData();
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || "Failed to accept");
        }
    };

    const handleReject = async (requestId: string) => {
        if (!user?.id) return;
        if (!confirm("Are you sure you want to reject this job?")) return;
        try {
            await providerService.rejectBooking(requestId);
            toast.success("Job Rejected");
            mutateRequests(); // Only requests affect rejection
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const handleJobClick = (booking: Booking) => {
        setSelectedJob(booking);
        setIsSheetOpen(true);
    };

    const tabs = [
        { id: 'requests', label: 'Requests', icon: Bell, count: requests.length },
        { id: 'active', label: 'Active', icon: Briefcase, count: activeJobs.length },
        { id: 'history', label: 'History', icon: CheckCircle, count: 0 },
    ];

    return (
        <ProviderLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">My Jobs</h1>
                    <p className="text-neutral-500">Manage your bookings and service requests.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Availability Toggle */}
                    <button
                        onClick={handleToggleOnline}
                        disabled={statusLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-sm
                            ${isOnline
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                            }`}
                    >
                        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                        {statusLoading ? 'Updating...' : (isOnline ? 'Online' : 'Offline')}
                    </button>

                    {/* Tabs */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-neutral-100 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                aria-label={`Switch to ${tab.label} tab`}
                                className={`flex-1 flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'bg-neutral-900 text-white shadow-md'
                                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {tab.count > 0 && <span className={`px-1.5 rounded text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-neutral-200 text-neutral-700'}`}>{tab.count}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading && currentData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p>Loading {activeTab}...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'requests' && currentData.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-neutral-100">
                                {isOnline ? (
                                    <EmptyState
                                        icon={Bell}
                                        title="No new job requests"
                                        description="You'll be notified when a customer books a service. Ensure you stay online."
                                        action={{ label: 'Refresh', onClick: refreshData }}
                                    />
                                ) : (
                                    <div className="py-8">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                            <Bell size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 mb-2">You are Offline</h3>
                                        <p className="text-neutral-500 max-w-sm mx-auto mb-6">
                                            Go Online to start receiving job requests from customers nearby.
                                        </p>
                                        <button
                                            onClick={handleToggleOnline}
                                            className="bg-brand-green text-black px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity"
                                        >
                                            Go Online Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'active' && currentData.length === 0 && (
                            <EmptyState
                                icon={Briefcase}
                                title="No active jobs"
                                description="Check 'Requests' to accept new work."
                                action={{ label: 'Refresh', onClick: refreshData }}
                            />
                        )}
                        {activeTab === 'history' && currentData.length === 0 && (
                            <EmptyState
                                icon={CheckCircle}
                                title="No history"
                                description="Completed jobs will show up here."
                                action={{ label: 'Refresh', onClick: refreshData }}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTab === 'requests' ? (
                                (currentData as DbBookingRequest[]).map((req) => (
                                    <JobCard
                                        key={req.id}
                                        job={req.bookings as any}
                                        isRequest={true}
                                        onAccept={() => handleAccept(req.id)}
                                        onReject={() => handleReject(req.id)}
                                        onClick={() => handleJobClick(req.bookings as any)}
                                    />
                                ))
                            ) : (
                                (currentData as Booking[]).map((booking) => (
                                    <JobCard
                                        key={booking.id}
                                        job={booking}
                                        onClick={() => handleJobClick(booking)}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            <JobDetailSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                job={selectedJob}
                onUpdate={refreshData}
            />
        </ProviderLayout>
    );
}


