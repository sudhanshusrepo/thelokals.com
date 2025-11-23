import React, { useState, useEffect } from 'react';
import { StepProps } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { useToast } from '../Toast';
import { useAuth } from '../../contexts/AuthContext';

export const PhoneStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [phone, setPhone] = useState(data.phoneNumber);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { signInWithPhone, verifyOtp } = useAuth();

  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
    }
    setLoading(true);
    try {
        const { error } = await signInWithPhone(`+91${phone}`);
        if (error) throw error;
        
        setOtpSent(true);
        setTimer(30);
        toast.success("OTP sent successfully.");
    } catch (err: any) {
        toast.error(err.message || "Failed to send OTP.");
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    setLoading(true);
    try {
        const { error } = await verifyOtp(`+91${phone}`, otp);
        if (error) throw error;

        updateData({ phoneNumber: phone, isPhoneVerified: true });
        toast.success("Phone verified successfully!");
        onNext();
    } catch (err: any) {
        toast.error(err.message || "Invalid OTP.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Let's get started</h2>
        <p className="text-slate-500 mt-2">Enter your mobile number to create your provider account.</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Mobile Number"
          type="tel"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          disabled={otpSent}
          maxLength={10}
        />

        {!otpSent ? (
          <Button 
            className="w-full" 
            onClick={handleSendOtp} 
            disabled={phone.length < 10}
            isLoading={loading}
          >
            Send OTP
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
              <label className="block text-sm font-medium text-brand-900 mb-2">
                Enter OTP sent to +91 {phone}
              </label>
              <div className="flex gap-2 justify-center">
                <Input
                  label=""
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  className="text-center text-xl tracking-widest"
                  maxLength={4}
                />
              </div>
              <div className="text-xs text-center mt-2 text-brand-700">
                 {timer > 0 ? `Resend in 00:${timer.toString().padStart(2, '0')}` : <button onClick={handleSendOtp} className="underline font-semibold">Resend OTP</button>}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleVerify}
              isLoading={loading}
              disabled={otp.length !== 4}
            >
              Verify & Continue
            </Button>
            <button 
              onClick={() => { setOtpSent(false); setOtp(''); }} 
              className="w-full text-sm text-slate-500 hover:text-slate-800 py-2"
            >
              Change Mobile Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
