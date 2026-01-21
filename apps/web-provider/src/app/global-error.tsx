
'use client';

import { useEffect } from 'react';
import { Inter } from "next/font/google";
import '../app/globals.css';

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Critical System Error</h2>
                        <p className="mb-6 text-gray-600">
                            The application encountered a critical error.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                        >
                            Restart Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
