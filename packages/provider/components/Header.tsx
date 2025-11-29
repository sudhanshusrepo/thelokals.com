import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../public/logo.svg';

interface HeaderProps {
    title?: string;
    showAutoSaving?: boolean;
    onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = "Registration", showAutoSaving = true, onSignInClick }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">

                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="thelokals logo" className="h-7 sm:h-8 w-auto" />
                            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tighter">
                                thelokals.com
                            </span>
                        </Link>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none sm:pointer-events-auto">
                        <h1 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">
                            {title}
                        </h1>
                    </div>

                    {showAutoSaving ? (
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Auto-saving</span>
                        </div>
                    ) : (
                        <button
                            onClick={onSignInClick}
                            className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
