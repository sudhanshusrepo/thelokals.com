
import React, { useState, useEffect } from 'react';
import { WorkerProfile } from '../../core/types';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../../core/services/bookingService';

interface BookingModalProps {
  worker: WorkerProfile | null;
  onClose: () => void;
  onAuthReq: () => void;
}

const ProgressStep: React.FC<{ isActive: boolean, isCompleted: boolean, label: string }> = ({ isActive, isCompleted, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
      {isCompleted ? '✓' : '●'}
    </div>
    <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
  </div>
);

export const BookingModal: React.FC<BookingModalProps> = ({ worker, onClose, onAuthReq }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (worker) {
      setStep(1);
      setNote('');
      setIsSubmitting(false);
    }
  }, [worker]);

  if (!worker) return null;

  const handleNextStep = () => {
    if (step === 1 && !user) {
      onAuthReq();
      return;
    }
    if (step === 1 && !note.trim()) return;
    setStep(prev => prev + 1);
  };

  const handleConfirmSend = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await bookingService.createBooking(worker.id, user.id, note, worker.price);
      setTimeout(() => setStep(3), 1000); 
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to create booking. Please try again.");
      setStep(2); // Go back to summary on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Details', 'Summary', 'Success'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {steps.map((label, index) => (
              <ProgressStep key={label} label={label} isActive={step === index + 1} isCompleted={step > index + 1} />
            ))}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <img src={worker.imageUrl} alt={worker.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg" />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl">{worker.name}</h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{worker.category}</p>
                        <div className="flex items-center gap-1 mt-1 text-yellow-500">
                           {'★'.repeat(Math.round(worker.rating))} <span className="text-xs text-gray-500 dark:text-gray-400">({worker.rating.toFixed(1)})</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Your Request</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all placeholder:text-gray-400 dark:text-white" rows={5} placeholder="e.g., I need my kitchen sink fixed, it's leaking from the base."></textarea>
                </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Request</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">You're one step away from connecting with {worker.name}.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Service Cost</span>
                    <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">${worker.price}<span className="text-base font-medium text-gray-500">/{worker.priceUnit}</span></span>
                </div>
                <div className="pt-3">
                    <span className="text-gray-500 dark:text-gray-400 block mb-2">Your Note</span>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 italic">
                      <p className="max-h-24 overflow-y-auto">"{note}"</p>
                    </div>
                </div>
              </div>
            </div>
          )}
           {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-fade-in">
               <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center text-5xl shadow-lg shadow-green-200 dark:shadow-green-900/50 animate-bounce-small">
                 ✓
               </div>
               <div>
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Success!</h3>
                 <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-sm mx-auto">
                    Your request has been sent to {worker.name}. You can track the status in your dashboard.
                 </p>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          {step === 1 && (
            <button onClick={handleNextStep} disabled={!note.trim()} className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-[0.98] ${note.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
              {user ? 'Proceed to Summary' : 'Sign In & Proceed'}
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold text-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Back
              </button>
              <button onClick={handleConfirmSend} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-bold text-lg bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200 dark:shadow-none transition-all transform active:scale-[0.98]">
                {isSubmitting ? 'Sending...' : 'Confirm & Book'}
              </button>
            </div>
          )}
          {step === 3 && (
            <button onClick={onClose} className="w-full py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-gray-300 dark:shadow-none">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
