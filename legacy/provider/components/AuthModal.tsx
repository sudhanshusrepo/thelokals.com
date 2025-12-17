import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@core/services/supabase';
import { AuthLayout, AuthField, AuthOAuthButton, AuthDivider } from '@core/components/auth';

interface AuthModalProps {
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

type AuthTab = 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'signup' }) => {
    const [activeTab, setActiveTab] = useState<AuthTab>(initialMode === 'login' ? 'signin' : 'signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (activeTab === 'signup' && !fullName.trim()) {
            toast.error('Please enter your full name');
            return false;
        }
        return true;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (activeTab === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Successfully signed in!');
                onClose();
            } else {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            fullName,
                            role: 'provider' // Mark as provider
                        }
                    },
                });
                if (signUpError) throw signUpError;
                toast.success('Check your email for the confirmation link!');
                onClose();
            }
        } catch (err: any) {
            if (err.message?.includes("User already registered") || err.message?.includes("already exists")) {
                toast.error("User already registered. Try signing in.");
                setActiveTab('signin');
            } else if (err.message?.includes("Invalid login credentials")) {
                toast.error("Invalid email or password.");
            } else {
                toast.error(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });
        if (error) {
            toast.error(error.message);
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
                            ? 'text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-slate-800/50'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        Sign In
                        {activeTab === 'signin' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'signup'
                            ? 'text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-slate-800/50'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        Sign Up
                        {activeTab === 'signup' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400"></div>
                        )}
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {activeTab === 'signin' ? 'Welcome Back' : 'Join as Partner'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {activeTab === 'signin'
                                ? 'Enter your details to manage your business'
                                : 'Start earning more with thelokals'}
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
                                placeholder="Business or Personal Name"
                            />
                        )}
                        <AuthField
                            label="Email Address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        <AuthField
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                activeTab === 'signin' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
