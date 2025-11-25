
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
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
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            
            <div className="flex-shrink-0">
              {!isHome ? (
                  <Link 
                      to="/"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold group"
                  >
                      <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Back</span>
                  </Link>
              ) : (
                  <Link to="/" className="flex items-center gap-2">
                       <span className="text-3xl">🏡</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tighter">thelokals.com</span>
                  </Link>
              )}
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <h1 className={`font-bold text-gray-900 dark:text-white transition-opacity duration-300 ${isHome ? 'opacity-0' : 'opacity-100'}`}>
                  {title}
                </h1>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setIsSearchVisible(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </button>
               <a 
                  href="https://pro.thelokals.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hidden sm:inline text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  For Professionals
                </a>

              {user ? (
                <div className="relative group">
                    <button 
                      className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <img 
                          src={user.user_metadata.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`}
                          alt="avatar" 
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 object-cover" />
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 scale-95 group-hover:scale-100 origin-top-right">
                        <Link to="/dashboard/bookings" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.DASHBOARD} /></svg>
                            Dashboard
                        </Link>
                        <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.SIGN_OUT} /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>
              ) : (
                  <button 
                      onClick={onSignInClick}
                      className="bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-gray-200 dark:shadow-none active:scale-[0.98]"
                  > 
                      Sign In
                  </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {isSearchVisible && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4" onClick={() => setIsSearchVisible(false)}>
            <div className="w-full max-w-lg mt-20" onClick={(e) => e.stopPropagation()}>
                <input
                    type="text"
                    placeholder="What service are you looking for?"
                    className="w-full p-4 text-lg rounded-xl shadow-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    autoFocus
                />
            </div>
        </div>
      )}
    </>
  );
};
