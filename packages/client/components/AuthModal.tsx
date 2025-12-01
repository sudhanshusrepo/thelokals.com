import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../../core/services/supabase';
import { AuthLayout, AuthField, AuthOAuthButton, AuthDivider } from '@core/components/auth';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      setLoading(false);
      return;
    }

    if (activeTab === 'signup' && !fullName.trim()) {
      showToast("Please enter your full name.", "error");
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast("Successfully signed in!", "success");
        onClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { fullName } },
        });
        if (signUpError) throw signUpError;
        showToast("Check your email for the confirmation link!", "success");
        onClose();
      }
    } catch (err: any) {
      if (err.message.includes("User already registered")) {
        showToast("A user with this email already exists. Try signing in instead.", "warning");
        setActiveTab('signin');
      } else {
        showToast(err.message || 'An unexpected error occurred.', "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Header */}
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'signin'
              ? 'text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-800/50'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
          >
            Sign In
            {activeTab === 'signin' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'signup'
              ? 'text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-800/50'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
          >
            Sign Up
            {activeTab === 'signup' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400"></div>
            )}
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {activeTab === 'signin' ? 'Enter your details to sign in' : 'Join thelokals to connect with experts'}
            </p>
          </div>

          <div className="space-y-4">
            <AuthOAuthButton
              onClick={() => handleOAuthLogin('google')}
              provider="google"
              label="Continue with Google"
            />
          </div>

          <AuthDivider />

          <form onSubmit={handleAuth} className="space-y-4">
            {activeTab === 'signup' && (
              <AuthField
                label="Full Name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            )}
            <AuthField
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="email-input"
              placeholder="john@example.com"
            />
            <AuthField
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="password-input"
              placeholder="••••••••"
              minLength={6}
              helperText="Password must be at least 6 characters long."
            />

            <button
              type="submit"
              disabled={loading}
              data-testid="submit-button"
              className={`w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                activeTab === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
