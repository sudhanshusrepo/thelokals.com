import React, { useState, useEffect } from 'react';
import { WorkerProfile } from '../../core/types';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../../core/services/bookingService';

interface BookingModalProps {
  worker: WorkerProfile | null;
  onClose: () => void;
  onAuthReq: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ worker, onClose, onAuthReq }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'contact' | 'summary' | 'sending' | 'success'>('contact');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes or worker changes
  useEffect(() => {
    if (worker) {
      setStep('contact');
      setNote('');
      setIsSubmitting(false);
    }
  }, [worker]);

  if (!worker) return null;

  const handleReview = () => {
    if (!user) {
        onAuthReq();
        return;
    }
    if (!note.trim()) return;
    setStep('summary');
  };

  const handleConfirmSend = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setStep('sending');
    try {
        await bookingService.createBooking(worker.id, user.id, note, worker.price);
        // Artificial delay for UX to show the spinner briefly before success
        setTimeout(() => setStep('success'), 1000);
    } catch (error) {
        console.error("Booking failed:", error);
        alert("Failed to create booking. Please try again.");
        setStep('summary');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-900 dark:bg-black text-white">
          <h2 className="font-bold text-lg">
            {step === 'contact' && 'Request Service'}
            {step === 'summary' && 'Confirm Details'}
            {step === 'sending' && 'Sending Request...'}
            {step === 'success' && 'Request Sent'}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 'contact' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                 <img src={worker.imageUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm" />
                 <div>
                   <h3 className="font-bold text-gray-900 dark:text-white text-lg">{worker.name}</h3>
                   <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{worker.category}</p>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">${worker.price}/{worker.priceUnit}</p>
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">What do you need help with?</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-400 dark:text-white"
                  rows={4}
                  placeholder="Describe the job details, preferred time, or specific issues..."
                />
              </div>

              {!user && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      You will need to sign in to send this request.
                  </div>
              )}
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6 animate-fade-in">
               <div className="flex items-center justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-2xl border-4 border-white dark:border-gray-700 shadow-lg">
                    📝
                  </div>
               </div>
               <div className="text-center">
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">Summary</h3>
                   <p className="text-gray-500 dark:text-gray-400 text-sm">Double check the details</p>
               </div>

               <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4 text-sm">
                  <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Professional</span>
                      <span className="font-bold text-gray-900 dark:text-white">{worker.name}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Service</span>
                      <span className="font-medium text-gray-900 dark:text-white">{worker.category}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Rate</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">${worker.price}/{worker.priceUnit}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 block mb-2">Your Note</span>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 italic">
                          "{note}"
                      </div>
                  </div>
               </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
               <div className="relative">
                   <div className="w-20 h-20 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-2xl">🚀</span>
                   </div>
               </div>
               <p className="text-gray-800 dark:text-gray-200 font-bold text-lg animate-pulse">Sending Request...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-green-100 dark:shadow-none animate-bounce-small">
                 ✓
               </div>
               <div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Request Sent!</h3>
                 <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                    You can track the live status of your request in your dashboard.
                 </p>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          {step === 'contact' && (
            <button 
              onClick={handleReview}
              disabled={!note.trim() || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-[0.98] ${
                  note.trim() && !isSubmitting
                  ? 'bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white shadow-gray-200 dark:shadow-none' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
              }`}
            >
              {user ? 'Review Request' : 'Sign In to Request'}
            </button>
          )}
          
          {step === 'summary' && (
            <div className="flex gap-3">
                <button 
                    onClick={() => setStep('contact')}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Back
                </button>
                <button 
                    onClick={handleConfirmSend}
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform active:scale-[0.98]"
                >
                    Confirm & Send
                </button>
            </div>
          )}

          {step === 'success' && (
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};