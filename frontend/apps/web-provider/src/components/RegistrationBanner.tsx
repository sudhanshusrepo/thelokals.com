import React, { useState } from 'react';

interface RegistrationBannerProps {
    onRegisterClick: () => void;
}

export const RegistrationBanner: React.FC<RegistrationBannerProps> = ({ onRegisterClick }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) {
        // Show minimal version when dismissed
        return (
            <div
                onClick={() => setIsDismissed(false)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 cursor-pointer hover:from-amber-600 hover:to-orange-600 transition-all"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>⚠️</span>
                        <span>Complete registration to accept bookings</span>
                    </div>
                    <button className="text-xs underline">Show Details</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-4 shadow-lg border-b-4 border-orange-600 animate-pulse-slow">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0 animate-bounce">⚠️</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Registration Required</h3>
                        <p className="text-sm text-amber-50 mb-3">
                            You're signed in but haven't completed your provider registration.
                            Complete your registration to start accepting booking requests and earning money!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={onRegisterClick}
                                className="px-6 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-all transform hover:scale-105 shadow-md"
                            >
                                Register Now
                            </button>
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="px-4 py-2 bg-orange-600/30 text-white font-semibold rounded-lg hover:bg-orange-600/50 transition-all"
                            >
                                Remind Me Later
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="text-white/80 hover:text-white text-2xl leading-none flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};
