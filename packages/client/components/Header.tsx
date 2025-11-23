import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ICONS } from '../constants';

interface HeaderProps {
  isHome: boolean;
  onBack: () => void;
  onLogoClick: () => void;
  title: string;
  onSignInClick: () => void;
  onDashboardClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    isHome, 
    onBack,
    onLogoClick,
    title,
    onSignInClick,
    onDashboardClick,
}) => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Side: Back button or Logo */}
          <div className="flex-shrink-0">
            {!isHome ? (
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Back</span>
                </button>
            ) : (
                <button onClick={onLogoClick} className="flex items-center gap-2">
                     <span className="text-3xl">🏡</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tighter">thelocals.co</span>
                </button>
            )}
          </div>

          {/* Center: Title (visible on scroll) */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <h1 className={`font-bold text-gray-900 dark:text-white transition-opacity duration-300 ${isHome ? 'opacity-0' : 'opacity-100'}`}>
                {title}
              </h1>
          </div>

          {/* Right Side: Auth buttons */}
          <div className="flex items-center gap-4">
             {/* The link to the provider app can live here */}
             <a 
                href="https://pro.thelocals.co.in" // Or your dev subdomain
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
                      <button onClick={onDashboardClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.DASHBOARD} /></svg>
                          Dashboard
                      </button>
                      <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2">
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
  );
};
