'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-red-500 mb-4">{error.message}</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded mb-4 max-w-lg overflow-auto text-left">
                        {error.stack}
                    </pre>
                    <button
                        onClick={() => reset()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
