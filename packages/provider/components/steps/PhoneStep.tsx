import React, { useState } from 'react';
import { ProviderProfile } from '../../types';
import toast from 'react-hot-toast';
import { backend } from '../../services/backend';

interface StepProps {
  data: ProviderProfile;
  updateData: (d: Partial<ProviderProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PhoneStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [phone, setPhone] = useState(data.phoneNumber);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    setIsSending(true);
    try {
      await backend.auth.sendOtp(phone);
      setOtpSent(true);
      updateData({ phoneNumber: phone });
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    setIsVerifying(true);
    try {
      await backend.auth.verifyOtp(phone, otp);
      updateData({ isPhoneVerified: true });
      toast.success('Phone number verified!');
      onNext();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-slate-700">Verify your Phone Number</h2>
        <p className="text-slate-500 mt-2">We'll send you a one-time password (OTP) to your mobile number.</p>

        <div className="mt-6">
          <label htmlFor="phone" className="block text-sm font-medium text-slate-600">Phone Number</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
              +91
            </span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300"
              placeholder="9876543210"
              disabled={otpSent}
            />
          </div>
        </div>

        {otpSent && (
          <div className="mt-4 animate-fade-in">
            <label htmlFor="otp" className="block text-sm font-medium text-slate-600">Enter OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter 6-digit OTP"
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        {!otpSent ? (
          <button onClick={handleSendOtp} disabled={isSending} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
            {isSending ? 'Sending OTP...' : 'Send OTP'}
          </button>
        ) : (
          <button onClick={handleVerifyOtp} disabled={isVerifying} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
            {isVerifying ? 'Verifying...' : 'Verify & Proceed'}
          </button>
        )}
      </div>
    </div>
  );
};