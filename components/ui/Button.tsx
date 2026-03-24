import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] shadow-sm focus:ring-primary',
        secondary: 'bg-accent text-white hover:bg-accent/90 hover:scale-[1.02] shadow-sm focus:ring-accent',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary',
        ghost: 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-200'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg'
    };

    const width = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
