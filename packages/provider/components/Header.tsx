import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    title?: string;
    showAutoSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title = "Registration", showAutoSaving = true }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">L</div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">TheLokals<span className="text-teal-600">Pro</span></span>
                        </Link>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
                        <h1 className="font-bold text-slate-900 dark:text-white">
                            {title}
                        </h1>
                    </div>

                    {showAutoSaving ? (
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Auto-saving</span>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
