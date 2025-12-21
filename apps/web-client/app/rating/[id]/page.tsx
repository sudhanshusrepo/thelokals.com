'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';

export default function RatingPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hover, setHover] = useState(0);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({
                    customer_rating: rating,
                    customer_review: review,
                    customer_rating_timestamp: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success("Thank you for your feedback!");
            router.push('/');

        } catch (e: any) {
            console.error(e);
            toast.error("Failed to submit rating");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-scale-in">
                <div className="text-6xl mb-6 animate-bounce">
                    Check Mark / Confetti
                    🎉
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Service Completed!</h1>
                <p className="text-slate-500 mb-8">
                    How was your experience with your provider?
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(rating)}
                            onClick={() => setRating(star)}
                        >
                            <span className={star <= (hover || rating) ? "text-amber-400 drop-shadow-sm" : "text-slate-200"}>
                                ★
                            </span>
                        </button>
                    ))}
                </div>

                {/* Rating Label */}
                {rating > 0 && (
                    <div className="text-indigo-600 font-bold text-lg mb-6 animate-fade-in">
                        {rating === 5 ? "Excellent! 🤩" :
                            rating === 4 ? "Very Good 🙂" :
                                rating === 3 ? "Average 😐" :
                                    rating === 2 ? "Poor 😞" : "Terrible 😡"}
                    </div>
                )}

                {/* Review Text Area */}
                <textarea
                    className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 mb-6 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all"
                    rows={3}
                    placeholder="Write a review (optional)..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>

                <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-slate-400 text-sm font-medium hover:text-slate-600"
                >
                    Skip Feedback
                </button>
            </div>
        </div>
    );
}
