'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Briefcase, Settings, CreditCard, LogOut, Menu, X, Bell, FileText, FileCheck, User, CheckCircle, Search } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole: 'CLIENT' | 'FREELANCER';
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    const navLinks = userRole === 'CLIENT' ? [
        { name: 'Overview', href: '/client/dashboard', icon: LayoutDashboard },
        { name: 'My Jobs', href: '/client/jobs', icon: Briefcase },
        { name: 'Proposal Center', href: '/client/proposals', icon: FileText },
        { name: 'Contracts', href: '/client/contracts', icon: FileCheck },
        { name: 'Messages', href: '/client/messages', icon: MessageSquare },
        { name: 'Profile', href: '/client/profile', icon: User },
    ] : [
        { name: 'Overview', href: '/freelancer/dashboard', icon: LayoutDashboard },
        { name: 'Find Jobs', href: '/freelancer/jobs', icon: Search },
        { name: 'My Proposals', href: '/freelancer/proposals', icon: Briefcase },
        { name: 'Messages', href: '/freelancer/messages', icon: MessageSquare },
        { name: 'Earnings', href: '/freelancer/earnings', icon: CreditCard },
        { name: 'Profile Settings', href: '/freelancer/settings', icon: Settings },
    ];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
            } catch (err) {
                console.error('Failed to load notifications', err);
            }
        };
        fetchNotifications();
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh(); // Force a clean slate
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const markAsRead = async (id?: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (id) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            } else {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-950 font-sans flex">

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="h-full flex flex-col pointer-events-auto">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-8 border-b border-gray-100 dark:border-gray-800 shrink-0 justify-between lg:justify-start">
                        <Link href="/" className="font-poppins font-bold text-2xl text-primary tracking-tight block">
                            GigNest<span className="text-accent">.</span>
                        </Link>
                        <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto w-full p-4 space-y-1">
                        <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 mt-4">Menu</p>

                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            let isActive = false;

                            // Handling child routes effectively for active state
                            if (link.href === '/client/dashboard' || link.href === '/freelancer/dashboard') {
                                isActive = pathname === link.href;
                            } else {
                                isActive = pathname?.startsWith(link.href) || false;
                            }

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors'}`} />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Footer User Area */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <span className="flex items-center gap-3"><LogOut className="w-5 h-5" /> Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 transition-transform">

                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-primary p-2 -ml-2 rounded-lg transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="font-poppins font-bold text-lg text-gray-900 dark:text-white capitalize hidden sm:block">
                            {pathname?.split('/')[2] || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <ThemeToggle />

                        <div ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 flex flex-col"
                                    >
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={() => markAsRead()} className="text-xs text-primary hover:underline font-medium">
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 divide-y divide-gray-50 dark:divide-gray-800/50">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 text-sm">
                                                    You're all caught up!
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="mt-0.5">
                                                                {!notification.isRead ? (
                                                                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                                                                ) : (
                                                                    <CheckCircle className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Scrollable Children Container */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 w-full block">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>

            </main>

        </div>
    );
}
