'use client';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { Construction } from 'lucide-react';

interface UnderConstructionProps {
    title: string;
}

export const UnderConstruction = ({ title }: UnderConstructionProps) => {
    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <Construction className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
                <p className="text-neutral-500 max-w-md">
                    This module is currently being built as part of the Admin Platform Overhaul.
                    Check back in upcoming sprints.
                </p>
            </div>
        </AdminLayout>
    );
};
