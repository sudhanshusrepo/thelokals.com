import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    title?: string;
    showAutoSaving?: boolean;
    onSignInClick?: () => void;
    isHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title = "Registration", showAutoSaving = true, onSignInClick }) => {
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B3A6] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#12B3A6]"></span>
                                </span>
                                <span className="text-xs text-[#0A2540] font-medium hidden sm:inline">Auto-saving</span>
                            </div >
                        ) : (
    <button
        onClick={onSignInClick}
        className="text-sm font-semibold text-[#64748B] hover:text-[#12B3A6] transition-colors px-4 py-2 rounded-lg hover:bg-[#F5F7FB]"
    >
        Sign In
    </button>
)}
                    </div >
                </div >
            </div >
        </header >
    );
};
