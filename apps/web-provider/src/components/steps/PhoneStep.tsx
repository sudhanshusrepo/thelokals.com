import React, { useState, useEffect } from 'react';
import { ProviderProfile } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { initializeRecaptcha, cleanupRecaptcha } from '@thelocals/core/services/firebaseAuth';
import { OTPService } from '@thelocals/core/services/otp';

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
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { signInWithPhone, verifyOtp } = useAuth();

  const isTestMode = OTPService.getTestOTP() !== null;

  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    setIsSending(true);
    try {
      // Use OTP bypass in test mode
      if (isTestMode) {
        const result = await OTPService.sendOTP(`+91${phone}`);
        if (result.success) {
          setOtpSent(true);
          updateData({ phoneNumber: phone });
          toast.success(result.message || 'OTP sent successfully!');
        } else {
          toast.error(result.message || 'Failed to send OTP');
        }
      } else {
        const recaptchaVerifier = initializeRecaptcha('recaptcha-container', 'invisible');
        const result = await signInWithPhone(`+91${phone}`, recaptchaVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
        updateData({ phoneNumber: phone });
        toast.success('OTP sent successfully!');
      }
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
      // Use OTP bypass in test mode
      if (isTestMode) {
        const isValid = await OTPService.verifyOTP(`+91${phone}`, otp);
        if (isValid) {
          updateData({ isPhoneVerified: true });
          toast.success('Phone number verified!');
          onNext();
        } else {
          toast.error('Invalid OTP. Please try again.');
        }
      } else {
        await verifyOtp(confirmationResult, otp);
        updateData({ isPhoneVerified: true });
        toast.success('Phone number verified!');
        onNext();
      }
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

        {isTestMode && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Test Mode Active</p>
                <p className="text-xs text-amber-600 mt-0.5">Use OTP code: <span className="font-mono font-bold">123456</span></p>
              </div>
            </div>
          </div>
        )}

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
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter 6-digit OTP"
            />
          </div>
        )}

        {/* Recaptcha Container */}
        {!isTestMode && <div id="recaptcha-container"></div>}
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