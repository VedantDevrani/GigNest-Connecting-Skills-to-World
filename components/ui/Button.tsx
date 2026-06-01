import React, { ButtonHTMLAttributes } from 'react';
import { Loader } from './Loader';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyle = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm focus:ring-primary',
        secondary: 'bg-accent text-white hover:bg-accent/90 shadow-sm focus:ring-accent',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary',
        ghost: 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-200'
    };

    const sizes = {
        sm: 'min-h-[34px] px-3 py-1.5 text-sm',
        md: 'min-h-[44px] px-5 py-2.5 text-base',
        lg: 'min-h-[52px] px-8 py-3.5 text-lg'
    };

    const width = fullWidth ? 'w-full' : '';
    const hoverScale = loading ? '' : 'hover:scale-[1.02]';

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${width} ${hoverScale} ${className}`}
            disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            <span className={loading ? 'invisible' : 'inline-flex items-center justify-center gap-2'}>
                {children}
            </span>
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Loader size="sm" variant="dots" />
                </span>
            )}
        </button>
    );
};
