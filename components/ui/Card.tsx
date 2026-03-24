import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => {
    const hoverStyle = hoverEffect ? 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300' : '';

    return (
        <div className={`bg-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 ${hoverStyle} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-xl font-semibold text-foreground ${className}`}>
        {children}
    </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`text-muted ${className}`}>
        {children}
    </div>
);
