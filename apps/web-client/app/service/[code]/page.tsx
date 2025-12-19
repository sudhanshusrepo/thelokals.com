'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const runtime = 'edge';

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        async function fetchService() {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('code', code)
                .single();

            if (data) setService(data);
            setLoading(false);
        }
        fetchService();
    }, [code]);

    const [selectedIssue, setSelectedIssue] = useState<string>('Standard Service');
    const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

    const issueTypes = [
        { id: 'standard', label: 'Standard Service', extra: 0 },
        { id: 'urgent', label: 'Urgent / Emergency', extra: 150 },
        { id: 'inspection', label: 'Inspection / Advice', extra: -100 },
    ];

    const basePrice = service ? service.base_price_cents / 100 : 0;
    const issueExtra = issueTypes.find(i => i.label === selectedIssue)?.extra || 0;
    const finalPrice = Math.round((basePrice + issueExtra) * surgeMultiplier);

    const handleBookNow = async () => {
        setBookingLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                try {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: 'demo@user.com',
                        password: 'password'
                    });
                    if (error) {
                        toast.error("Please login to book");
                        return;
                    }
                } catch (err) {
                    toast.error("Login required");
                    return;
                }
            }

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            // Mock Finding Provider Animation Page
            // Store simple booking intent in localStorage to pass to next screen
            const bookingIntent = {
                service_code: code,
                service_name: service.name,
                base_price: basePrice,
                final_price: finalPrice,
                issue_type: selectedIssue
            };
            localStorage.setItem('booking_intent', JSON.stringify(bookingIntent));

            router.push('/booking/match'); // Route to Match Screen first

        } catch (e: any) {
            toast.error(e.message || "Booking Failed");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Service...</div>;
    if (!service) return <div className="p-10 text-center">Service not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <div className="bg-white/90 backdrop-blur-sm p-4 sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200">
                <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                    <span className="text-xl">←</span>
                </button>
                <h1 className="font-bold text-lg text-slate-900">{service.name}</h1>
            </div>

            <main className="p-4 max-w-md mx-auto space-y-4">
                {/* Hero Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-4">
                        🔧
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{service.name}</h2>
                    <p className="text-slate-600 leading-relaxed text-sm">{service.description}</p>

                    <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                            <span>⏱</span> {service.duration_minutes_min}-{service.duration_minutes_min + 30} mins
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                            <span>🛡</span> Verified Pros
                        </div>
                    </div>
                </div>

                {/* Issue Type Selection (Bible 6.3) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Select Issue Type</h3>
                    <div className="space-y-2">
                        {issueTypes.map((type) => (
                            <label key={type.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedIssue === type.label ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="issue"
                                        value={type.label}
                                        checked={selectedIssue === type.label}
                                        onChange={(e) => setSelectedIssue(e.target.value)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{type.label}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500">
                                    {type.extra > 0 ? `+₹${type.extra}` : type.extra < 0 ? `-₹${Math.abs(type.extra)}` : 'Base'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Pricing Transparency (Bible 6.3) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Pricing Breakdown</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Base Price</span>
                            <span>₹{basePrice}</span>
                        </div>
                        {issueExtra !== 0 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Issue Adjustment</span>
                                <span>{issueExtra > 0 ? '+' : '-'}₹{Math.abs(issueExtra)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                            <span>Safety & Support Fee</span>
                            <span>₹9</span>
                        </div>
                        {surgeMultiplier > 1 && (
                            <div className="flex justify-between text-amber-600 font-medium">
                                <span>High Demand Surge (x{surgeMultiplier})</span>
                                <span>+₹{Math.round((basePrice + issueExtra) * (surgeMultiplier - 1))}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
                            <span>Total Estimate</span>
                            <span>₹{finalPrice + 9}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">
                            Final price may vary slightly based on spare parts used.
                        </p>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 backdrop-blur-lg bg-white/90">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleBookNow}
                        disabled={bookingLoading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {bookingLoading ? (
                            <>
                                <span className="animate-spin">⏳</span> Processing...
                            </>
                        ) : (
                            <>
                                Book Service <span className="text-indigo-200">|</span> ₹{finalPrice + 9}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
