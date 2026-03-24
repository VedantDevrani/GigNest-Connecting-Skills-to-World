import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
    children: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-inter transition-colors';

    const variants = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        primary: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50',
        outline: 'border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-200',
    };

    return (
        <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
            {children}
        </span>
    );
}
