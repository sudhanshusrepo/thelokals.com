import React from 'react';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong
                </h2>

                <p className="text-gray-600 mb-6">
                    We encountered an unexpected error. Our team has been notified.
                </p>

                {process.env.NODE_ENV !== 'production' && (
                    <div className="bg-red-50 p-4 rounded-lg text-left mb-6 overflow-auto max-h-48">
                        <p className="text-red-800 font-mono text-xs break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <button
                    onClick={resetErrorBoundary}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};
