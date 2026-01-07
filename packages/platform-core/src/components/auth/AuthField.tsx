import React from 'react';

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helperText?: string;
}

export const AuthField: React.FC<AuthFieldProps> = ({ label, helperText, className = '', ...props }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input
                className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${className}`}
                {...props}
            />
            {helperText && <p className="text-xs text-slate-500 mt-2">{helperText}</p>}
        </div>
    );
};
