'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Upload, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RatingPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.requestId as string;

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (photos.length + files.length > 3) {
            toast.error('Maximum 3 photos allowed');
            return;
        }
        setPhotos([...photos, ...files.slice(0, 3 - photos.length)]);
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Thank you for your feedback!', {
            icon: '🎉',
            duration: 3000,
        });

        // Navigate to home
        setTimeout(() => {
            router.push('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface border-b border-neutral-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Rate Your Service</h1>
                        <p className="text-sm text-muted">Request #{requestId.slice(0, 8)}</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Service Completed Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-gradient-to-br from-success/10 to-primary/10 border-2 border-success rounded-2xl text-center"
                >
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Service Completed!
                    </h2>
                    <p className="text-muted">
                        How was your experience? Your feedback helps us improve.
                    </p>
                </motion.div>

                {/* Star Rating */}
                <div className="mb-8 bg-surface rounded-2xl p-8 border border-neutral-200 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4 text-center">
                        Rate Your Experience
                    </h3>

                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => {
                                    setRating(star);
                                    // Haptic feedback
                                    if (navigator.vibrate) {
                                        navigator.vibrate(30);
                                    }
                                }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="focus:outline-none"
                            >
                                <Star
                                    size={48}
                                    className={`transition-all duration-200 ${star <= (hoveredRating || rating)
                                            ? 'fill-accent-amber text-accent-amber'
                                            : 'text-neutral-300'
                                        }`}
                                    style={{
                                        filter: star <= (hoveredRating || rating)
                                            ? 'drop-shadow(0 0 8px rgba(247, 200, 70, 0.6))'
                                            : 'none',
                                    }}
                                />
                            </motion.button>
                        ))}
                    </div>

                    {rating > 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-muted"
                        >
                            {rating === 5 && '🌟 Excellent!'}
                            {rating === 4 && '😊 Great!'}
                            {rating === 3 && '👍 Good'}
                            {rating === 2 && '😐 Fair'}
                            {rating === 1 && '😞 Poor'}
                        </motion.p>
                    )}
                </div>

                {/* Written Review */}
                <div className="mb-8 bg-surface rounded-2xl p-6 border border-neutral-200 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                        Share Your Experience (Optional)
                    </h3>
                    <textarea
                        value={review}
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setReview(e.target.value);
                            }
                        }}
                        placeholder="Tell us about your experience... What did you like? What could be better?"
                        rows={4}
                        className="w-full px-4 py-3 bg-background border-2 border-neutral-200 focus:border-primary rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm text-muted">
                            Help others make informed decisions
                        </p>
                        <span className={`text-sm ${review.length > 450 ? 'text-warning' : 'text-muted'}`}>
                            {review.length}/500
                        </span>
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="mb-8 bg-surface rounded-2xl p-6 border border-neutral-200 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                        Add Photos (Optional)
                    </h3>
                    <p className="text-sm text-muted mb-4">
                        Upload up to 3 photos of the completed work
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square">
                                <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-2 right-2 p-1 bg-error rounded-full text-white hover:bg-error/80 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {photos.length < 3 && (
                            <label className="aspect-square border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                <Upload size={32} className="text-muted mb-2" />
                                <span className="text-sm text-muted">Upload Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-6 border-t border-neutral-200 -mx-4 px-4">
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="w-full group relative px-8 py-4 bg-accent-amber hover:bg-warning disabled:bg-neutral-300 disabled:cursor-not-allowed text-secondary font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 flex items-center justify-center gap-3"
                        style={{ fontSize: '18px', minHeight: '56px' }}
                    >
                        <span className="relative z-10">
                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </span>

                        {/* Glow effect */}
                        {!isSubmitting && rating > 0 && (
                            <div className="absolute inset-0 bg-accent-amber rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
