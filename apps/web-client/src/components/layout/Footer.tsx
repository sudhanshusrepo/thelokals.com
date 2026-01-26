'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-lokals-green">About Us</Link></li>
                            <li><Link href="/terms" className="hover:text-lokals-green">Terms</Link></li>
                            <li><Link href="/privacy" className="hover:text-lokals-green">Privacy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Partner</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/partner" className="hover:text-lokals-green">Register as Pro</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                    <p>&copy; 2026 The Lokals. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart size={12} className="fill-red-500 text-red-500" /> in India
                    </p>
                </div>
            </div>
        </footer>
    );
}
