'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong!</h2>
                <p className="mb-6 text-gray-600">
                    We encountered an unexpected error. Please try again.
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
