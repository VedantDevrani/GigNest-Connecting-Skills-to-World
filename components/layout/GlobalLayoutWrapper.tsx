'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const isDashboard = pathname.startsWith('/client') || pathname.startsWith('/freelancer');

    return (
        <div className={`flex flex-col min-h-screen`}>
            {!isDashboard && <Navbar />}
            <div className="flex-1">
                {children}
            </div>
            {!isDashboard && <Footer />}
        </div>
    );
}
