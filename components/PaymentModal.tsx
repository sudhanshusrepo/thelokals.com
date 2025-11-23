
import React, { useState } from 'react';
import { Booking } from '../types';
import { bookingService } from '../services/bookingService';

interface PaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
        try {
            await bookingService.processPayment(booking.id);
            onPaymentSuccess();
            onClose();
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed. Please try again.");
            setIsProcessing(false);
        }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <div className="p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-green-100">
                    💳
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Complete payment for {booking.worker?.name}
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">Service Fee</span>
                    <span className="font-bold text-gray-900">${booking.total_price}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Taxes & Fees</span>
                    <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-indigo-600">${booking.total_price}</span>
                </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            defaultValue="4242 4242 4242 4242"
                        />
                         <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                        <input 
                            type="text" 
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            defaultValue="12/25"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                        <input 
                            type="text" 
                            placeholder="123"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            defaultValue="123"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 mt-4 active:scale-[0.98]"
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Processing...
                        </span>
                    ) : (
                        `Pay $${booking.total_price}`
                    )}
                </button>
            </form>
            
            <div className="mt-4 flex justify-center gap-2 opacity-50 grayscale">
                <span className="text-xs text-gray-400">Powered by SecurePay</span>
            </div>
        </div>
      </div>
    </div>
  );
};
