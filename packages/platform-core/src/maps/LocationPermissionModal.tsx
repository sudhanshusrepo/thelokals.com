
import React from 'react';

interface LocationPermissionModalProps {
    open: boolean;
    onGrant: () => void;
}

export function LocationPermissionModal({ open, onGrant }: LocationPermissionModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Enable Location Services</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    We need your location to show available services and providers in your immediate area.
                </p>
                <button
                    onClick={onGrant}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md active:transform active:scale-95"
                >
                    Allow Location Access
                </button>
            </div>
        </div>
    );
}
