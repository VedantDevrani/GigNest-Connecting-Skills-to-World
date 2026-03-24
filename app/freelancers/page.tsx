import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function FreelancersPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-white font-sans">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold font-poppins text-gray-900 mb-4">Hire Talent</h1>
                    <p className="text-gray-500 text-lg">Browse our elite network of available professional freelancers.</p>
                </div>

                {/* Temporary Empty State */}
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-center px-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <span className="text-primary text-3xl">👥</span>
                    </div>
                    <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-4">Under Construction</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        The backend API and database routes for browsing user profiles haven't been implemented yet.
                    </p>
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
