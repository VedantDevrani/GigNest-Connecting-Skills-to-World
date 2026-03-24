'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { name: 'Find Work', href: '/jobs' },
    { name: 'Hire Talent', href: '/freelancers' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        // Check initially
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 sm:px-6 pointer-events-none">
            <motion.header
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className={`w-full max-w-7xl pointer-events-auto transition-all duration-300 rounded-2xl md:rounded-full ${scrolled
                    ? 'bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl shadow-lg border border-white/20 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-transparent'
                    }`}
            >
                <div className="px-5 md:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full md:rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-shadow shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                        >
                            <span className="text-white font-bold text-2xl leading-none pt-0.5">G</span>
                        </motion.div>
                        <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">Gig<span className="text-primary">Nest</span></span>
                    </Link>

                    {/* Desktop Nav - No background container box anymore */}
                    <nav className="hidden md:flex items-center gap-1 md:gap-2 px-2 py-1.5">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.name} href={link.href} className="relative px-4 py-1.5 rounded-full group">
                                    <span className={`relative z-10 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted hover:text-foreground'}`}>
                                        {link.name}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mt-1"
                                            style={{ bottom: '4px' }}
                                            initial={false}
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                        />
                                    )}
                                    {!isActive && (
                                        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary/40 transition-all scale-x-0 group-hover:scale-x-100 rounded-full mt-1" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden md:flex items-center gap-3 lg:gap-5">
                        <ThemeToggle />
                        <Link href="/login" className="text-sm border border-transparent font-medium text-muted hover:text-foreground transition-colors px-2">
                            Log in
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/register" className="text-sm font-medium bg-primary text-white px-5 lg:px-6 py-2 rounded-full hover:opacity-90 transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                                Sign up
                            </Link>
                        </motion.div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-3 md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 -mr-1 text-muted hover:text-foreground transition-colors relative z-50 rounded-full focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="md:hidden overflow-hidden bg-white/40 dark:bg-[#111827]/40 backdrop-blur-md rounded-b-2xl border-t border-gray-200/50 dark:border-gray-700/50"
                        >
                            <div className="flex flex-col items-center justify-start py-6 px-6 gap-2">
                                {navLinks.map((link, i) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <motion.div
                                            key={link.name}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.2 }}
                                            className="w-full"
                                        >
                                            <Link
                                                href={link.href}
                                                className={`block text-center py-3 px-4 rounded-xl text-lg font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >
                                                {link.name}
                                            </Link>
                                        </motion.div>
                                    );
                                })}

                                <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: navLinks.length * 0.03 + 0.05, duration: 0.2 }}
                                    className="w-full flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                                >
                                    <Link href="/login" className="text-lg font-medium text-foreground py-2.5 text-center border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                                        Log in
                                    </Link>
                                    <Link href="/register" className="text-lg font-medium bg-primary text-white py-2.5 text-center rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all">
                                        Sign up
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </div>
    );
};
