import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes (standard practice)
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
        const variants = {
            primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200',
            secondary: 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100',
            outline: 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
            ghost: 'bg-transparent text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50',
            danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs rounded-lg',
            md: 'px-4 py-2.5 text-sm rounded-xl',
            lg: 'px-6 py-4 text-base font-bold rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
