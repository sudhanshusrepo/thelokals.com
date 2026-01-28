
'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={40} className="text-gray-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-8">
                    Looks like you haven't added any services yet.
                    Explore our services to find what you need.
                </p>

                <Link
                    href="/services/plumbing"
                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-lokals-primary hover:bg-lokals-primary/90 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Browse Services
                </Link>
            </div>
        </div>
    );
}
