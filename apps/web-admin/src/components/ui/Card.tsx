import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    action?: ReactNode;
}

export function Card({ children, className, title, action }: CardProps) {
    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-neutral-100", className)}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    {title && <h3 className="font-bold text-neutral-900">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
