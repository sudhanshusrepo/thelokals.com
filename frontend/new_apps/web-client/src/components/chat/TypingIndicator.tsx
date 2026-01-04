import React from 'react';

export const TypingIndicator = () => {
    return (
        <div className="flex gap-3 mb-4 flex-row">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-white opacity-50">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </div>
            <div className="bg-white border border-neutral-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
};
