'use client';

import { useAuth } from '../../contexts/AuthContext';

export default function UnauthorizedPage() {
    const { signOut, user } = useAuth();

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg border border-neutral-100 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚫</span>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
                <p className="text-neutral-500 mb-6">
                    The account <strong>{user?.email}</strong> is not authorized to access the Admin Portal.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => signOut()}
                        className="w-full bg-neutral-900 text-white font-medium py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Sign Out
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white border border-neutral-200 text-neutral-700 font-medium py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        </div>
    );
}
