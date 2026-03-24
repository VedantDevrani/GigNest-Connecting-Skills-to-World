import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
            <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                <div className="col-span-2 lg:col-span-2">
                    <Link href="/" className="font-poppins font-bold text-2xl text-primary tracking-tight mb-4 block">
                        GigNest<span className="text-accent">.</span>
                    </Link>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                        Connecting world-class freelance talent with ambitious companies. Build your dream team, faster.
                    </p>
                    <div className="flex space-x-4 text-gray-400">
                        {/* Social mock icons */}
                        {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                            <a key={social} href="#" className="hover:text-primary transition-colors text-sm font-medium">{social}</a>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">For Clients</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <li><Link href="/freelancers" className="hover:text-primary transition-colors">How to Hire</Link></li>
                        <li><Link href="/freelancers" className="hover:text-primary transition-colors">Talent Marketplace</Link></li>
                        <li><Link href="/freelancers" className="hover:text-primary transition-colors">Pricing</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">For Talent</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <li><Link href="/jobs" className="hover:text-primary transition-colors">Find Work</Link></li>
                        <li><Link href="/jobs" className="hover:text-primary transition-colors">Create Profile</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-6 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 font-medium">
                <p>© {new Date().getFullYear()} GigNest Inc. All rights reserved.</p>
                <div className="flex space-x-6">
                    <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Terms of Service</Link>
                    <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
}
