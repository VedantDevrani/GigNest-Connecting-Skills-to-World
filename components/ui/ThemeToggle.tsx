'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';

interface ThemeToggleProps {
    variant?: 'dashboard' | 'landing';
}

export function ThemeToggle({ variant = 'dashboard' }: ThemeToggleProps) {
    const { setTheme, theme } = useTheme();

    const baseClasses = "flex items-center justify-center relative focus:outline-none transition-colors";
    const variantClasses = variant === 'dashboard' 
        ? "w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary"
        : "w-10 h-10 rounded-xl bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800";

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`${baseClasses} ${variantClasses}`}
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
