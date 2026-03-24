import React from 'react';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function Avatar({ src, fallback, size = 'md', className = '', ...props }: AvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-lg',
    };

    return (
        <div
            className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary/10 border border-primary/20 ${sizeClasses[size]} ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={fallback}
                    className="h-full w-full object-cover"
                    {...props}
                />
            ) : (
                <span className="font-semibold text-primary font-poppins uppercase">
                    {fallback.substring(0, 2)}
                </span>
            )}
        </div>
    );
}
