import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
    onAccept?: () => void;
    onDecline?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
    onAccept,
    onDecline
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check local storage
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
        onAccept?.();
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
        onDecline?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-slide-up">
            <div className="max-w-md mx-auto flex flex-col gap-4">
                <div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        We use cookies to improve your experience and show you relevant local services.
                        By using our app, you agree to our <a href="#" className="text-primary underline">Privacy Policy</a>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all active:scale-95"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};
