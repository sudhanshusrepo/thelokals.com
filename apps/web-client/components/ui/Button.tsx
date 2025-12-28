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
            primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20',
            secondary: 'bg-white text-secondary hover:bg-primary/5 border border-primary/10',
            outline: 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary hover:text-primary',
            ghost: 'bg-transparent text-neutral-600 hover:text-primary hover:bg-primary/5',
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
                    'inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95]',
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
