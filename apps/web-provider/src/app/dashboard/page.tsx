'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to accept jobs");
                return;
            }

            // Update booking status
            const { error } = await supabase
                .from('bookings')
                .update({
                    status: 'ACCEPTED',
                    provider_id: user.id
                })
                .eq('id', jobId);

            if (error) throw error;

            toast.success("Job Accepted! Proceed to location.");
            // Refresh list
            setJobs(jobs.filter(j => j.id !== jobId));

        } catch (e: any) {
            toast.error("Failed to accept job: " + e.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Available Jobs</h1>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Online
                    </div>
                </header>

                {loading ? (
                    <div className="text-center py-10">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-lg p-10 text-center shadow-sm">
                        <p className="text-gray-500">No new jobs in your area.</p>
                        <p className="text-xs text-gray-400 mt-2">We will notify you when requests arrive.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-600">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">
                                            {job.service_code.replace('_', ' ').toUpperCase()}
                                        </h3>
                                        <p className="text-gray-600 mt-1">₹{job.total_amount_cents / 100}</p>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <span>📍 4.2 km away</span>
                                            <span>•</span>
                                            <span>Sector 45, Gurugram</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAcceptJob(job.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Accept
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
