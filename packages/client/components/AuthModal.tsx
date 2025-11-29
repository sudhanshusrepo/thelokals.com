
import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../../core/services/supabase';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
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

    if (!isLogin && !fullName.trim()) {
      showToast("Please enter your full name.", "error");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" data-testid="auth-modal">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {isLogin ? 'Enter your details to sign in' : 'Join thelokals to connect with experts'}
              </p>
            </div>

            <div className="space-y-4">
              <button onClick={() => handleOAuthLogin('google')} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Continue with Google</span>
              </button>
            </div>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-slate-200 dark:border-slate-600" />
              <span className="mx-4 text-sm text-slate-400 dark:text-slate-500">OR</span>
              <hr className="flex-grow border-slate-200 dark:border-slate-600" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="John Doe" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="email-input" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="john@example.com" />
              </div>
              <div>
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="password-input" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="••••••••" minLength={6} />
                <p className="text-xs text-slate-500 mt-2">Password must be at least 6 characters long.</p>
              </div>
              <button type="submit" disabled={loading} data-testid="submit-button" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-200 dark:shadow-none active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span>
                ) : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={() => { setIsLogin(!isLogin); }} data-testid="toggle-auth-mode" className="text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
