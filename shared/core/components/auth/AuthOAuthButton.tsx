import React from 'react';

interface AuthOAuthButtonProps {
    onClick: () => void;
    provider: 'google';
    label: string;
}

export const AuthOAuthButton: React.FC<AuthOAuthButtonProps> = ({ onClick, provider, label }) => {
    return (
        <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {provider === 'google' && (
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
            )}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </button>
    );
};
