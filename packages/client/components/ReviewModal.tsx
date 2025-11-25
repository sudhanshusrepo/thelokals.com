
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Booking } from '../../core/types';
import { bookingService } from '../../core/services/bookingService';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        await bookingService.submitReview(
            booking.id,
            booking.worker_id,
            booking.user_id,
            rating,
            comment
        );
        onReviewSubmitted();
        onClose();
    } catch (e) {
        console.error(e);
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Rate your experience</h2>
                <p className="text-gray-500 text-sm mb-6">How was the service with {booking.worker?.name}?</p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4"
                    rows={3}
                    placeholder="Write a comment (optional)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />

                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                
                <button onClick={onClose} className="mt-3 text-sm text-gray-500 hover:text-gray-800">
                    Skip
                </button>
            </div>
        </div>
    </div>
  );
};
