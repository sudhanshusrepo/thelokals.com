import React from 'react';

export interface BenefitCardProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description
}) => {
    return (
        <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                {icon || <span className="text-2xl">✨</span>}
            </div>
            <div>
                <h3 className="font-bold text-slate-900 mb-1 text-base">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </div>
    );
};
