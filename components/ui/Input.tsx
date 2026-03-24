import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = true,
    className = '',
    id,
    ...props
}) => {
    const width = fullWidth ? 'w-full' : '';
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`flex flex-col gap-1.5 ${width} ${className}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-foreground">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors
          ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                {...props}
            />
            {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
        </div>
    );
};
