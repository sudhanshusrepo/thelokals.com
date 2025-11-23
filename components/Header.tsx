import React from 'react';
import { ICONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onBack?: () => void;
  title?: string;
  isHome?: boolean;
  onSignInClick: () => void;
  onDashboardClick: () => void;
  onLogoClick: () => void;
  onProfessionalClick?: () => void; // New prop
}

export const Header: React.FC<HeaderProps> = ({ 
    onBack, 
    title = "thelocals.co", 
    isHome = false, 
    onSignInClick,
    onDashboardClick,
    onLogoClick,
    onProfessionalClick
}) => {
  const { user, signOut } = useAuth();

  const getInitials = () => {
    if (!user) return '';
    const name = user.user_metadata?.full_name;
    if (name) {
      return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email?.substring(0, 2).toUpperCase() || '??';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome && onBack && (
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.CHEVRON_LEFT} />
              </svg>
            </button>
          )}
          <button 
            onClick={onLogoClick}
            className={`font-extrabold text-xl tracking-tight ${!isHome ? 'text-gray-800 dark:text-white' : 'text-indigo-600 dark:text-indigo-400'} hover:opacity-80 transition-opacity`}
          >
            {title}
          </button>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-3 group relative">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Logged in as</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none truncate max-w-[100px]">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                </div>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold text-sm border-2 border-white dark:border-gray-700 shadow-md group-hover:scale-105 transition-transform">
                  {getInitials()}
                </button>
                
                {/* Dropdown for SignOut */}
                <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 p-2">
                     <button 
                        onClick={onDashboardClick}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium flex items-center gap-3"
                     >
                        <span className="text-lg">📊</span> My Dashboard
                     </button>
                     {onProfessionalClick && (
                        <button 
                            onClick={onProfessionalClick}
                            className="w-full text-left px-4 py-3 text-sm text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium flex items-center gap-3"
                        >
                            <span className="text-lg">💼</span> Switch to Pro View
                        </button>
                     )}
                     <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                     <button 
                        onClick={signOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center gap-3"
                     >
                        <span className="text-lg">🚪</span> Sign Out
                     </button>
                </div>
             </div>
          ) : (
            <button 
                onClick={onSignInClick}
                className="text-sm font-bold text-white bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors px-5 py-2.5 rounded-full shadow-lg shadow-gray-200 dark:shadow-none"
            >
                Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};