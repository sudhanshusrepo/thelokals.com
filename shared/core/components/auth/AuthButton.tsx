import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ loading, children, className = '', disabled, ...props }) => {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-200 dark:shadow-none active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 ${className}`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                </span>
            ) : (
                children
            )}
        </button>
    );
};
