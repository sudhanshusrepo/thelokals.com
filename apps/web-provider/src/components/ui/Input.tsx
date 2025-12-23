import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[#0A2540] mb-2">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all
          ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#E2E8F0] focus:border-[#12B3A6] focus:ring-[#12B3A6]'
                    }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          placeholder:text-[#64748B]
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-[#64748B]">{helperText}</p>
            )}
        </div>
    );
};
