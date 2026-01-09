import React from 'react';

interface SurfaceProps {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    elevated?: boolean;
}

export const Surface = ({ className = '', children, onClick, elevated = false }: SurfaceProps) => (
    <div
        onClick={onClick}
        className={`
            bg-white rounded-2xl p-4 border border-gray-100 
            ${elevated ? 'shadow-card hover:shadow-card-hover hover:scale-[1.02]' : 'shadow-sm'} 
            transition-all duration-300 
            ${className}
        `}
    >
        {children}
    </div>
);

export const HeroSurface = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
    <div className={`
        relative overflow-hidden rounded-2xl 
        bg-gradient-to-br from-lokals-yellow/20 via-lokals-green/10 to-blue-50 
        border border-white/50 shadow-card
        ${className}
    `}>
        {children}
    </div>
);

export const CardGrid = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {children}
    </div>
);

export const Section = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
    <section className={`mt-6 space-y-3 ${className}`}>
        {children}
    </section>
);
