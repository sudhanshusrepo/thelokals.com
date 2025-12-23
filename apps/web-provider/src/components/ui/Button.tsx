import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseStyles = 'font-bold rounded-xl transition-all transform active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantStyles = {
        primary: 'bg-[#0A2540] text-white hover:bg-[#06192E] focus:ring-[#0A2540] shadow-md hover:shadow-lg',
        secondary: 'bg-[#12B3A6] text-white hover:bg-[#0e9085] focus:ring-[#12B3A6] shadow-md hover:shadow-lg',
        outline: 'bg-transparent border-2 border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white focus:ring-[#0A2540]',
        ghost: 'bg-transparent text-[#0A2540] hover:bg-[#F5F7FB] focus:ring-[#0A2540]'
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
