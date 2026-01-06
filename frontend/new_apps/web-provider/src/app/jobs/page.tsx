'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useEffect, useState } from 'react';
import { providerService } from '@thelocals/core/services/providerService';
import { Booking, DbBookingRequest } from '@thelocals/core/types';
import { JobCard } from '../../components/v2/JobCard';
import { toast } from 'react-hot-toast';
import { Loader2, Bell, Briefcase, CheckCircle } from 'lucide-react';
import { JobDetailSheet } from '../../components/v2/JobDetailSheet';

import { useJobsData } from '../../hooks/useJobsData';

export default function JobsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('active');

    const { requests, activeJobs, historyJobs, isLoading: loading, mutateRequests, mutateActive } = useJobsData(user?.id, activeTab);

    // Combine data based on active tab for display
    const currentData = activeTab === 'requests' ? requests :
        activeTab === 'active' ? activeJobs : historyJobs;

    const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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

            <div className="space-y-4">
                {loading && currentData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p>Loading {activeTab}...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'requests' && currentData.length === 0 && (
                            <EmptyState message="No new job requests." />
                        )}
                        {activeTab === 'active' && currentData.length === 0 && (
                            <EmptyState message="No active jobs. Stay online to get requests!" />
                        )}
                        {activeTab === 'history' && currentData.length === 0 && (
                            <EmptyState message="No past jobs found." />
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

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-neutral-300" size={32} />
        </div>
        <p className="text-neutral-500 font-medium">{message}</p>
    </div>
);
