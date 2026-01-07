import React from 'react';

export const AuthDivider: React.FC = () => {
    return (
        <div className="flex items-center my-6">
            <hr className="flex-grow border-slate-200 dark:border-slate-600" />
            <span className="mx-4 text-sm text-slate-400 dark:text-slate-500">OR</span>
            <hr className="flex-grow border-slate-200 dark:border-slate-600" />
        </div>
    );
};
