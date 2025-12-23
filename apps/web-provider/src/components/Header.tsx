import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    title?: string;
    showAutoSaving?: boolean;
    onSignInClick?: () => void;
    isHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title = "Registration", showAutoSaving = true, onSignInClick }) => {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-[#12B3A6]">
                            Lokals Provider
                        </Link>
                        {title && (
                            <span className="ml-4 text-gray-600">
                                {title}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {showAutoSaving ? (
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B3A6] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#12B3A6]"></span>
                                </span>
                                <span className="text-xs text-[#0A2540] font-medium hidden sm:inline">Auto-saving</span>
                            </div>
                        ) : (
                            onSignInClick && (
                                <button
                                    onClick={onSignInClick}
                                    className="text-sm font-semibold text-[#64748B] hover:text-[#12B3A6] transition-colors px-4 py-2 rounded-lg hover:bg-[#F5F7FB]"
                                >
                                    Sign In
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
