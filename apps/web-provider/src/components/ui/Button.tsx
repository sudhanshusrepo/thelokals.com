import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    children,
    disabled,
    ...props
}) => {
    const baseStyles = 'font-bold rounded-xl transition-all transform active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';

    const variants = {
        primary: 'bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary shadow-md hover:shadow-lg',
        secondary: 'bg-accent text-accent-foreground hover:opacity-90 focus:ring-accent shadow-md hover:shadow-lg',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary',
        ghost: 'bg-transparent text-primary hover:bg-background focus:ring-primary'
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizeStyles[size]} ${className} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-current" />
            ) : null}
            {children}
        </button>
    );
};
