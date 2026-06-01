import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/logo.png';

type LogoVariant = 'navbar' | 'sidebar' | 'footer';

const variantConfig: Record<LogoVariant, { width: number; height: number; className: string }> = {
    navbar: { width: 132, height: 39, className: 'h-8 sm:h-9 w-auto' },
    sidebar: { width: 124, height: 36, className: 'h-8 w-auto' },
    footer: { width: 140, height: 42, className: 'h-9 w-auto' },
};

interface LogoProps {
    variant?: LogoVariant;
    className?: string;
    href?: string;
    priority?: boolean;
}

export function Logo({ variant = 'navbar', className = '', href = '/', priority }: LogoProps) {
    const { width, height, className: sizeClass } = variantConfig[variant];

    const image = (
        <Image
            src={logo}
            alt="GigNest"
            width={width}
            height={height}
            className={`object-contain object-left ${sizeClass} ${className}`.trim()}
            priority={priority ?? variant === 'navbar'}
        />
    );

    if (!href) return image;

    return (
        <Link href={href} className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg">
            {image}
        </Link>
    );
}
