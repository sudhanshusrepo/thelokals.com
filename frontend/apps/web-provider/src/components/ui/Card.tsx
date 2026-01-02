import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    glass = false
}) => {
    const baseStyles = 'rounded-2xl p-6 border transition-all';
    const glassStyles = glass ? 'bg-white/70 backdrop-blur-lg border-white/20' : 'bg-white border-[#E2E8F0]';
    const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 hover:border-[#12B3A6]/30 cursor-pointer' : 'shadow-sm';

    return (
        <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
};
