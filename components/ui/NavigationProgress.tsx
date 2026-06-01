'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const prevPathname = useRef(pathname);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (prevPathname.current === pathname) return;
        prevPathname.current = pathname;

        setVisible(true);
        setProgress(30);

        const t1 = window.setTimeout(() => setProgress(70), 80);
        const t2 = window.setTimeout(() => setProgress(90), 200);
        const t3 = window.setTimeout(() => {
            setProgress(100);
            window.setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 150);
        }, 350);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [pathname]);

    if (!visible && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
            aria-hidden="true"
        >
            <div
                className="h-full bg-primary transition-[width,opacity] duration-150 ease-out shadow-[0_0_6px_rgba(161,130,249,0.5)]"
                style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
            />
        </div>
    );
}
