'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DashboardClient() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningJobId, setActioningJobId] = useState<string | null>(null);

    // Poll for new jobs (Mock Real-time for MVP Phase 2)
    useEffect(() => {
        const fetchJobs = async () => {
            // Query PENDING bookings
            // In real app: Filter by location/category
            const { data, error } = await supabase
                .from('bookings')
                .select('*, services(name)') // Join to get service name (assuming relation exists or we fetch)
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false });

            if (data) setJobs(data);
            setLoading(false);
        };

        fetchJobs();
        const interval = setInterval(fetchJobs, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }, []);

    const handleAcceptJob = async (jobId: string) => {
        setActioningJobId(jobId);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to accept jobs");
                return;
            }

            // Update booking status to CONFIRMED
            const { error } = await supabase
                .from('bookings')
                .update({
                    status: 'CONFIRMED',
                    provider_id: user.id
                })
                .eq('id', jobId);

            if (error) throw error;

            toast.success("Job Accepted! Navigate to location.");
            // Remove from list and redirect to active job
            setJobs(jobs.filter(j => j.id !== jobId));
            router.push(`/active-job/${jobId}`);

        } catch (e: any) {
            toast.error("Failed to accept job: " + e.message);
        } finally {
            setActioningJobId(null);
        }
    };

    const handleDeclineJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to decline this job?')) return;

        setActioningJobId(jobId);
        try {
            // Update booking status to CANCELLED or keep PENDING for other providers
            // For now, we'll just remove it from this provider's view
            setJobs(jobs.filter(j => j.id !== jobId));
            toast.success("Job declined");

        } catch (e: any) {
            toast.error("Failed to decline job");
        } finally {
            setActioningJobId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-6 bg-white rounded-xl p-4 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Available Jobs</h1>
                        <p className="text-sm text-slate-500">Accept jobs to start earning</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        Online
                    </div>
                </header>

                {loading ? (
                    <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-slate-900 font-semibold text-lg mb-2">No new jobs in your area</p>
                        <p className="text-sm text-slate-500">We'll notify you when requests arrive</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-lg text-slate-900">
                                                {job.service_code.replace(/_/g, ' ').toUpperCase()}
                                            </h3>
                                            <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-1 rounded">
                                                NEW
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                            <span className="flex items-center gap-1">
                                                📍 4.2 km away
                                            </span>
                                            <span>•</span>
                                            <span>Sector 45, Gurugram</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-indigo-600">₹{job.total_amount_cents / 100}</span>
                                            <span className="text-sm text-slate-500">estimated</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAcceptJob(job.id)}
                                        disabled={actioningJobId === job.id}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actioningJobId === job.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Accepting...
                                            </span>
                                        ) : 'Accept Job'}
                                    </button>
                                    <button
                                        onClick={() => handleDeclineJob(job.id)}
                                        disabled={actioningJobId === job.id}
                                        className="px-6 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
