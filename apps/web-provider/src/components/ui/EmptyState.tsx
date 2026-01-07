import React from 'react';
import { LucideIcon, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    iconClassName?: string;
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    iconClassName = "text-neutral-400"
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-dashed border-neutral-200 text-center">
            {Icon && (
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <Icon className={iconClassName} size={32} />
                </div>
            )}
            <h3 className="text-neutral-900 font-bold text-lg mb-1">{title}</h3>
            {description && (
                <p className="text-neutral-500 text-sm max-w-xs mx-auto mb-6">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                    {action.label === 'Refresh' && <RefreshCw size={14} />}
                    {action.label}
                </button>
            )}
        </div>
    );
}
