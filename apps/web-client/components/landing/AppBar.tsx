import React from 'react';

interface AppBarProps {
    logo?: React.ReactNode;
    title?: string;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
    logo,
    title = "lokals Studio",
    primaryActionLabel = "Launch App",
    secondaryActionLabel = "Plans",
    onPrimaryAction,
    onSecondaryAction
}) => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 dark:bg-slate-900/80 transition-all duration-300">
            <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left: Logo & Title */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                        {logo || "L"}
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground">
                        {title}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSecondaryAction}
                        className="text-xs font-medium text-slate-600 hover:text-primary px-3 py-2 rounded-full hover:bg-slate-50 transition-colors"
                    >
                        {secondaryActionLabel}
                    </button>
                    <button
                        onClick={onPrimaryAction}
                        className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-slate-800 transition-all active:scale-95"
                    >
                        {primaryActionLabel}
                    </button>
                </div>
            </div>
        </header>
    );
};
