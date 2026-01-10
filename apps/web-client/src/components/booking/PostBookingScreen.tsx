'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, CreditCard, ChevronRight } from 'lucide-react';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { useRouter } from 'next/navigation';

export default function PostBookingScreen() {
    const router = useRouter();
    const { context, send, state } = useBookingLogic();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const isPaymentPending = state === 'PAYMENT_PENDING';
    const isCompleted = state === 'COMPLETED';

    const handlePayment = () => {
        // Mock Payment Processing
        setTimeout(() => {
            send('PAYMENT_SUCCESS');
        }, 1500);
    };

    const handleSubmitFeedback = () => {
        send('SUBMIT_FEEDBACK', { rating } as any);
        router.push('/'); // Return home
    };

    if (isPaymentPending) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Completed!</h2>
                    <p className="text-gray-500 mb-8">Please settle the payment to complete the booking.</p>

                    <div className="bg-gray-50 p-4 rounded-xl mb-8 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Total Amount</span>
                        <span className="font-bold text-2xl text-gray-900">{PricingUtils.formatPrice(context.price || 0)}</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                        <CreditCard size={20} />
                        Pay Securely
                    </button>
                </motion.div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">How was {context.provider?.name}?</h2>
                    <p className="text-gray-500 mb-8">Your feedback helps us improve.</p>

                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:text-yellow-200'}`}
                            >
                                <Star size={40} fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your experience (optional)..."
                        className="w-full p-4 bg-gray-50 rounded-xl mb-6 text-sm outline-none focus:ring-2 focus:ring-black/5"
                        rows={3}
                    />

                    <button
                        onClick={handleSubmitFeedback}
                        disabled={rating === 0}
                        className={`w-full py-4 rounded-xl font-bold transition-colors ${rating > 0 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Submit Feedback
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
}
