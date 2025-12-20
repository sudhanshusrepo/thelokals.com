'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// export const runtime = 'edge';
export const dynamic = 'force-dynamic';


export default function ActiveJobPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [job, setJob] = useState<any>(null);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (data) setJob(data);
            setLoading(false);
        };
        fetchJob();
    }, [id]);

    const handleStartJob = async () => {
        if (otp.length !== 6) {
            toast.error("Enter valid 6-digit OTP");
            return;
        }
        setActionLoading(true);
        try {
            // Call RPC
            const { data: isValid, error } = await supabase.rpc('verify_booking_otp', {
                p_booking_id: id,
                p_otp_code: otp
            });

            if (error) throw error;

            if (isValid) {
                toast.success("OTP Verified! Job Started.");
                setJob({ ...job, status: 'IN_PROGRESS' });
            } else {
                toast.error("Invalid OTP. Try again.");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteJob = async () => {
        setActionLoading(true);
        try {
            // Call RPC or Direct Update (RPC allows logic)
            // `complete_booking` takes p_final_cost.
            const finalCost = job.total_amount_cents || job.base_price_cents;

            const { data: success, error } = await supabase.rpc('complete_booking', {
                p_booking_id: id,
                p_final_cost: finalCost
            });

            if (error) throw error;

            if (success) {
                toast.success("Job Completed Successfully!");
                setJob({ ...job, status: 'COMPLETED' });
                // Redirect to dashboard after delay
                setTimeout(() => router.push('/dashboard'), 2000);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (!job) return <div className="p-8">Loading Job...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
                <h1 className="text-xl font-bold mb-1">Job #{id.slice(0, 8)}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                        {job.status.replace('_', ' ')}
                    </span>
                    {/* Phase 6 Issue Type */}
                    {job.issue_type && (
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${job.issue_type === 'Urgent / Emergency' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'}`}>
                            {job.issue_type}
                        </span>
                    )}
                </div>

                {/* Status: ACCEPTED (Needs OTP) */}
                {job.status === 'ACCEPTED' && (
                    <div>
                        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                Ask the customer for the start PIN to begin the service.
                            </p>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                        <input
                            type="text"
                            className="w-full text-center text-3xl tracking-[0.5em] font-mono border-2 border-gray-300 rounded-lg p-3 focus:border-indigo-500 outline-none mb-6"
                            placeholder="......"
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                        />

                        <button
                            onClick={handleStartJob}
                            disabled={actionLoading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition"
                        >
                            {actionLoading ? 'Verifying...' : 'Verify & Start Job'}
                        </button>
                    </div>
                )}

                {/* Status: IN_PROGRESS */}
                {job.status === 'IN_PROGRESS' && (
                    <div>
                        <div className="text-center py-10">
                            <div className="animate-pulse text-6xl mb-4">⏱️</div>
                            <h2 className="text-xl font-bold">Service In Progress</h2>
                            <p className="text-gray-500">Perform the service safely.</p>
                        </div>

                        <button
                            onClick={handleCompleteJob}
                            disabled={actionLoading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition"
                        >
                            {actionLoading ? 'Completing...' : 'Mark Job Complete'}
                        </button>
                    </div>
                )}

                {/* Status: COMPLETED */}
                {job.status === 'COMPLETED' && (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4 text-green-500">✅</div>
                        <h2 className="text-xl font-bold">Job Done!</h2>
                        <p className="text-gray-500 mb-6">Earnings: ₹{job.final_cost / 100}</p>

                        {/* Phase 6 Rating Display */}
                        {job.customer_rating ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mx-4">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-2">Customer Rating</div>
                                <div className="text-3xl mb-1">
                                    {[...Array(job.customer_rating)].map((_, i) => <span key={i} className="text-amber-400">★</span>)}
                                </div>
                                {job.customer_review && (
                                    <p className="text-sm text-slate-600 italic">"{job.customer_review}"</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 animate-pulse">Waiting for customer feedback...</div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}
