'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function JobSearchFilter() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/jobs');
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, title, or skills..."
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700"
                />
            </div>
            <Button type="submit" className="h-12 px-8">Filter Jobs</Button>
        </form>
    );
}
