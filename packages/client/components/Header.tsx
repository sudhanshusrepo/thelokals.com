
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../core/services/supabase';
import { ICONS } from '../constants';
import { User } from '@supabase/supabase-js';


interface HeaderProps {
  isHome: boolean;
  title: string;
  onSignInClick: () => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isHome,
  title,
  onSignInClick,
  onSearch,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user;
      setUser(currentUser ?? null);
    });

    fetchUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      onSearch(searchQuery);
      setIsSearchVisible(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            <div className="flex-shrink-0">
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
                <Link to="/" className="flex items-center gap-2" aria-label="thelokals homepage">
                  <img src="/logo.svg" alt="thelokals logo" className="h-7 sm:h-8 w-auto" />
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tighter">thelokals.com</span>
                </Link>
              )}
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none sm:pointer-events-auto">
              <h1 className={`font-semibold text-slate-800 dark:text-white transition-opacity duration-300 text-sm sm:text-base ${isHome ? 'opacity-0' : 'opacity-100'}`}>
                {title}
              </h1>
            </div>

            <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main Navigation">
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
              <a
                href="https://pro.thelokals.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                aria-label="For Professionals (opens in new tab)"
              >
                For Professionals
              </a>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Open user menu"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                  >
                    <img
                      src={user.user_metadata.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`}
                      alt=""
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                      aria-hidden="true"
                    />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 transition-all duration-200 scale-95 group-hover:scale-100 origin-top-right" role="menu">
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2" role="menuitem">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.SIGN_OUT} /></svg>
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
      {isSearchVisible && (
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
