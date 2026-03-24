'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, DollarSign, Calendar, Target, Briefcase, ChevronLeft, ChevronRight, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function FreelancerFindJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search & Filters
    const [search, setSearch] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [skillsQuery, setSkillsQuery] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                q: search,
                minBudget: minBudget || '0',
                skills: skillsQuery,
                page: page.toString(),
                limit: '10'
            });

            const res = await fetch(`/api/freelancer/jobs?\${query.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();

            setJobs(data.jobs || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalJobs(data.pagination?.total || 0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Refetch on page change or filter submit
    useEffect(() => {
        fetchJobs();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchJobs();
    };

    return (
        <div className="space-y-6 fade-in max-w-6xl mx-auto">

            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10 dark:border-primary/20">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white mb-2">Find Work</h1>
                    <p className="text-gray-500">Discover and apply to the best matching projects for your skills.</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">

                {/* Advanced Filters Bar (Horizontal) */}
                <div className="w-full">
                    <Card className="p-4 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 lg:items-end">

                            <div className="hidden lg:flex items-center gap-2 px-2 pb-2 mr-2 border-r border-gray-100 dark:border-gray-800">
                                <Filter className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-gray-900 dark:text-white font-poppins pr-4">Filters</h3>
                            </div>

                            <div className="space-y-1 flex-1 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Job title..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 flex-1 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Budget ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="e.g. 500"
                                        value={minBudget}
                                        onChange={(e) => setMinBudget(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 flex-1 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Skills</label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="react, python..."
                                        value={skillsQuery}
                                        onChange={(e) => setSkillsQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-auto mt-2 lg:mt-0">
                                <Button type="submit" className="w-full lg:w-32 py-2.5 h-[42px]">Apply</Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Job Listings Area */}
                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <p className="font-medium text-gray-600 dark:text-gray-400">Showing {totalJobs} {totalJobs === 1 ? 'Job' : 'Jobs'}</p>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-gray-500 animate-pulse">Searching for perfect matches...</div>
                    ) : error ? (
                        <div className="py-12 text-center text-red-500">{error}</div>
                    ) : jobs.length === 0 ? (
                        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed bg-transparent border-2 border-gray-200 dark:border-gray-800 shadow-none">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                            <p className="text-gray-500">We couldn't find any jobs matching those filters. Try adjusting your search criteria.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {jobs.map((job) => (
                                    <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                                        <Card className="p-6 bg-white dark:bg-gray-900 hover:shadow-lg transition-all border-gray-100 dark:border-gray-800 overflow-hidden relative group cursor-pointer">

                                            {/* Top indicators */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white group-hover:text-primary transition-colors">{job.title}</h2>
                                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-1">
                                                        <User className="w-4 h-4" /> Client: {job.client?.name} • Posted {new Date(job.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {/* Match Percentage Badge */}
                                                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border \${
                                                    job.matchPercentage >= 80 
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                        : job.matchPercentage >= 50
                                                        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                                                        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                }`}>
                                                    {job.matchPercentage}% Match
                                                </div>
                                            </div>

                                            {/* Description snippet */}
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-5">
                                                {job.description}
                                            </p>

                                            {/* Skills */}
                                            {job.skills && job.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-5">
                                                    {job.skills.slice(0, 5).map((skill: string) => (
                                                        <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.skills.length > 5 && (
                                                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-400 rounded-md">+{job.skills.length - 5} more</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Footer metrics */}
                                            <div className="flex sm:items-center flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 justify-between">
                                                <div className="flex items-center gap-6">
                                                    <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                                                        <DollarSign className="w-4 h-4 text-primary" /> $\${job.budget} Fixed
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                                        <Calendar className="w-4 h-4" /> Due: {new Date(job.deadline).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hidden sm:flex">
                                                        <FileText className="w-4 h-4" /> {job._count?.proposals} Proposals
                                                    </span>
                                                </div>
                                                <Link href={`/freelancer/jobs/${job.id}`}>
                                                    <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                                        Apply Now
                                                    </Button>
                                                </Link>
                                            </div>

                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 py-6">
                                    <Button
                                        variant="outline"
                                        disabled={page === 1}
                                        onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={page === totalPages}
                                        onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}

                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
