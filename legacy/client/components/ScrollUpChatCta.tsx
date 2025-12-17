import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollUpChatCtaProps {
    onOpenChat: () => void;
}

export const ScrollUpChatCta: React.FC<ScrollUpChatCtaProps> = ({ onOpenChat }) => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const lastScrollY = useRef(0);
    const hasLoggedShow = useRef(false);

    // Check if we are on allowed pages
    const isAllowedPage = location.pathname === '/' || location.pathname.startsWith('/service/');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (!isAllowedPage) {
                setIsVisible(false);
                return;
            }

            // Show if scrolling UP and > 300px from top
            // Hide if scrolling DOWN or near top (< 300px)
            if (currentScrollY > 300 && currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            } else if (currentScrollY <= 300 || currentScrollY > lastScrollY.current) {
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        // Throttle using requestAnimationFrame
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [isAllowedPage]);

    // Analytics: Log when shown (debounce to avoid spamming logs)
    useEffect(() => {
        if (isVisible && !hasLoggedShow.current) {
            // Analytics log removed
            hasLoggedShow.current = true;
        } else if (!isVisible) {
            hasLoggedShow.current = false;
        }
    }, [isVisible, location.pathname]);

    const handleClick = () => {
        onOpenChat();
    };

    if (!isAllowedPage) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <button
                onClick={handleClick}
                className="w-full bg-teal-600 text-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-teal-700 transition-colors flex flex-col items-center justify-center group"
                aria-label="Chat to Book in 60s"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Chat to Book in 60s</span>
                    {/* Up arrow icon indicating slide up or action */}
                    <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </div>
                <span className="text-sm text-teal-100 group-hover:text-white transition-colors">
                    Ask our AI to find the right local helper.
                </span>
            </button>
        </div>
    );
};
