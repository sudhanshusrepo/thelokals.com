import React from 'react';

interface SurfaceProps {
    className?: string;
    elevated?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}

export const Surface = ({ className = '', elevated = false, children, onClick }: SurfaceProps) => (
    <div
        onClick={onClick}
        className={`
        bg-white rounded-2xl border border-gray-100 p-4 shadow-card
        ${elevated ? 'hover:shadow-card-hover hover:scale-[1.02] hover:-translate-y-1' : ''}
        transition-all duration-300 ${className}
    `}>
        {children}
    </div>
);

interface SectionProps {
    className?: string;
    children: React.ReactNode;
}

export const Section = ({ className = '', children }: SectionProps) => (
    <section className={`mt-6 space-y-3 ${className}`}>
        {children}
    </section>
);
