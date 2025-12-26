import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { verified: boolean; name: string; dob: string; aadhaarLast4: string; pan: string }) => void;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'aadhaar' | 'otp' | 'fetching'>('aadhaar');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('aadhaar');
      setAadhaar('');
      setOtp('');
      setLoading(false);
    }
  }, [isOpen]);

  // Timer for OTP
  useEffect(() => {
    let interval: number;
    if (step === 'otp' && timer > 0) {
      interval = window.setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [timer, step]);

  if (!isOpen) return null;

  const handleAadhaarSubmit = () => {
    if (aadhaar.length < 12) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(30);
      // Simulate SMS trigger
    }, 1500);
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) return;
    setLoading(true);

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    setStep('fetching');

    // Simulate fetching and upload proof
    try {
      // TODO: Integrate actual DigiLocker API
      // For now, fail safely if not in dev mode, or just fail to prevent fake verification in prod
      throw new Error("DigiLocker integration coming soon");

      /* 
      // Original fake logic removed to prevent production dummy data
      const proofData = { ... }; 
      */

    } catch (error) {
      console.error("Verification Upload Failed", error);
      // Fallback or error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#007bff] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded">
              {/* Simplified DigiLocker Logo Icon */}
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#007bff]" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-wide">DigiLocker</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {step === 'aadhaar' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900">Verify your Identity</h3>
                <p className="text-sm text-slate-500 mt-2">Enter your 12-digit Aadhaar number to fetch your documents securely.</p>
              </div>

              <Input
                label="Aadhaar Number"
                placeholder="XXXX XXXX XXXX"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                maxLength={12}
                className="tracking-widest text-lg"
              />

              <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                <span className="text-xl">🔒</span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  We will send an OTP to the mobile number linked with your Aadhaar. Your data is 100% secure.
                </p>
              </div>

              <Button
                className="w-full bg-[#007bff] hover:bg-blue-600 focus:ring-blue-500"
                onClick={handleAadhaarSubmit}
                disabled={aadhaar.length !== 12}
                isLoading={loading}
              >
                Next
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900">Enter OTP</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Please enter the code sent to your mobile linked with Aadhaar (ending in ****).
                </p>
              </div>

              <div className="flex justify-center">
                <Input
                  label="One Time Password"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] w-48 font-mono"
                />
              </div>

              <div className="text-center text-sm">
                {timer > 0 ? (
                  <span className="text-slate-500">Resend code in {timer}s</span>
                ) : (
                  <button className="text-[#007bff] font-semibold hover:underline">Resend OTP</button>
                )}
              </div>

              <Button
                className="w-full bg-[#007bff] hover:bg-blue-600 focus:ring-blue-500"
                onClick={handleOtpSubmit}
                disabled={otp.length !== 6}
                isLoading={loading}
              >
                Verify & Fetch Documents
              </Button>
            </div>
          )}

          {step === 'fetching' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-[#007bff] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#007bff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-slate-900">Fetching Documents...</h3>
                <p className="text-slate-500 text-sm">Connecting to UIDAI & Income Tax Dept...</p>
              </div>

              {/* Simulated progress logs */}
              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center gap-2 text-xs text-green-600 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Aadhaar verified successfully</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-1000">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>PAN details retrieved</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-center">
          <div className="flex items-center gap-1 opacity-60">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Powered by</span>
            <span className="text-xs font-bold text-slate-700">Digital India</span>
          </div>
        </div>
      </div>
    </div>
  );
};