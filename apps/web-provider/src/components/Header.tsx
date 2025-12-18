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
        <header
            className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800"
            style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">

                    {/* Left: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img src="/logo.svg" alt="thelokals logo" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 tracking-tight hidden sm:block">
                                thelokals<span className="text-orange-500">.com</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center: Title (Dynamic) */}
                    <div className="flex-1 flex justify-center min-w-0">
                        {title && (
                            <h1 className="font-semibold text-slate-800 dark:text-white text-base sm:text-lg truncate max-w-[200px] sm:max-w-md text-center">
                                {title}
                            </h1>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-shrink-0 flex items-center justify-end min-w-[80px]">
                        {showAutoSaving ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                <span className="text-xs text-orange-700 font-medium hidden sm:inline">Auto-saving</span>
                            </div>
                        ) : (
                            <button
                                onClick={onSignInClick}
                                className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-orange-50"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
