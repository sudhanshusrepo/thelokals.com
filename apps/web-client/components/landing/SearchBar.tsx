import React from 'react';

interface SearchBarProps {
    placeholder?: string;
    onSubmit?: (value: string) => void;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Search for services (AC, cab, electrician...)",
    onSubmit,
    className
}) => {
    return (
        <div className={`relative group ${className || ''}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                    className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                placeholder={placeholder}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSubmit?.(e.currentTarget.value);
                    }
                }}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
                <button className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
