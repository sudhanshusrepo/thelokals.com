import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

export interface NavItem {
    label: string;
    to?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'primary';
}

export interface AppHeaderProps {
    title: string;
    isHome: boolean;
    user: User | null;
    onSignInClick: () => void;
    onSignOutClick: () => void;
    onSearch?: (query: string) => void;
    showSearch?: boolean;
    logoSrc?: string;
    appName?: string;
    navItems?: NavItem[];
    className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    isHome,
    user,
    onSignInClick,
    onSignOutClick,
    onSearch,
    showSearch = false,
    logoSrc = "/logo-small.png",
    appName = "thelokals.com",
    navItems = [],
    className = '',
}) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            onSearch?.(searchQuery);
            setIsSearchVisible(false);
            setSearchQuery('');
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-sm h-16 ${className}`}
                role="banner"
                style={{
                    paddingTop: 'env(safe-area-inset-top)',
                    paddingLeft: 'env(safe-area-inset-left)',
                    paddingRight: 'env(safe-area-inset-right)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full">

                        <div className="flex-shrink-0 min-w-[80px] sm:min-w-[120px]">
                            {!isHome ? (
                                <Link
                                    to="/"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold group"
                                    aria-label="Go back to homepage"
                                >
                                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="hidden sm:inline">Back</span>
                                </Link>
                            ) : (
                                <Link to="/" className="flex items-center gap-2" aria-label="Homepage">
                                    <img src={logoSrc} alt="Logo" className="h-7 sm:h-8 w-auto" />
                                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tighter">{appName}</span>
                                </Link>
                            )}
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none sm:pointer-events-auto max-w-[40%] sm:max-w-none px-2">
                            <h1 className={`font-semibold text-slate-800 dark:text-white transition-opacity duration-300 text-sm sm:text-base truncate ${isHome ? 'opacity-0' : 'opacity-100'}`}>
                                {title}
                            </h1>
                        </div>

                        <nav className="flex items-center gap-2 sm:gap-4 min-w-[80px] sm:min-w-[120px] justify-end" aria-label="Main Navigation">
                            {showSearch && (
                                <button
                                    onClick={() => setIsSearchVisible(true)}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                    aria-label="Open search bar"
                                    aria-expanded={isSearchVisible}
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            )}

                            {navItems.map((item, index) => (
                                item.to ? (
                                    <Link
                                        key={index}
                                        to={item.to}
                                        className="hidden sm:inline text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={item.onClick}
                                        className="hidden sm:inline text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                )
                            ))}

                            {user ? (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                        aria-label="Open user menu"
                                        aria-expanded={isMenuOpen}
                                        aria-haspopup="true"
                                    >
                                        <img
                                            src={user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`}
                                            alt=""
                                            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                                            aria-hidden="true"
                                        />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 transition-all duration-200 origin-top-right" role="menu">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signed in as</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    navigate('/dashboard/profile');
                                                    setMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                role="menuitem"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                View Profile
                                            </button>

                                            <button
                                                onClick={() => {
                                                    onSignOutClick();
                                                    setMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                role="menuitem"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    data-testid="sign-in-button"
                                    onClick={onSignInClick}
                                    className="bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-bold py-2 px-3 sm:py-2.5 sm:px-5 rounded-xl transition-all shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.98] text-sm sm:text-base"
                                    aria-label="Sign In"
                                >
                                    Sign In
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </header >
            {isSearchVisible && showSearch && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4" onClick={() => setIsSearchVisible(false)}>
                    <div className="w-full max-w-lg mt-10 sm:mt-20" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            placeholder="What service are you looking for?"
                            className="w-full p-4 text-base sm:text-lg rounded-xl shadow-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            autoFocus
                        />
                    </div>
                </div>
            )
            }
        </>
    );
};
