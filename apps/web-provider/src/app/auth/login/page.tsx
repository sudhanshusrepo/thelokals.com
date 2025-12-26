'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect /auth/login to /auth/signin
        router.replace('/auth/signin');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2540] mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to sign in...</p>
            </div>
        </div>
    );
}
