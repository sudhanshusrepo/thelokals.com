
'use client';

import Link from 'next/link';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export const IdentityBanner = () => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-neutral-900">Verify your Identity</h3>
                    <p className="text-sm text-neutral-600">Get the "Verified" badge and 3x more jobs.</p>
                </div>
            </div>
            <Link
                href="/digilocker/intro"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
                Verify Now <ChevronRight size={16} />
            </Link>
        </div>
    );
};
