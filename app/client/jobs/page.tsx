'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Briefcase, CreditCard, Star, TrendingUp, Users, Calendar, MapPin, Edit3, Trash2, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    skills: string[];
    status: 'OPEN' | 'CLOSED';
    createdAt: string;
    _count: {
        proposals: number;
    }
}

export default function ClientJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/client/jobs');
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            setJobs(data.jobs || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            const res = await fetch(`/api/client/jobs/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete job');
            setJobs(jobs.filter(job => job.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        try {
            const res = await fetch(`/api/client/jobs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update job status');
            setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus as any } : job));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading your jobs...</div>;
    }

    return (
        <div className="space-y-6 fade-in max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">My Jobs</h1>
                    <p className="text-gray-500 mt-1">Manage your active and completed job postings.</p>
                </div>
                <Link href="/client/jobs/create">
                    <Button className="px-6 py-2">
                        + Post a New Job
                    </Button>
                </Link>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            {jobs.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs posted yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't posted any jobs yet. Create your first job posting to start receiving proposals from top talent.</p>
                    <Link href="/client/jobs/create">
                        <Button>Post Your First Job</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full"
                            >
                                <Card className="p-6 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">{job.title}</h2>
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${job.status === 'OPEN' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                                                <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> ${job.budget} fixed</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                                <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                                {job.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {job.skills.map(skill => (
                                                    <span key={skill} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-100 dark:border-gray-700">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col justify-end gap-3 md:min-w-[180px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                                            <div className="hidden md:block mb-2">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Proposals</p>
                                                <p className="text-2xl font-bold text-primary">{job._count.proposals}</p>
                                            </div>

                                            <div className="flex md:flex-col gap-2 w-full">
                                                {job.status === 'OPEN' ? (
                                                    <Button variant="outline" size="sm" className="w-full flex justify-center items-center gap-2" onClick={() => handleToggleStatus(job.id, job.status)}>
                                                        <XCircle className="w-4 h-4" /> Close full
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="w-full flex justify-center items-center gap-2" onClick={() => handleToggleStatus(job.id, job.status)}>
                                                        <CheckCircle2 className="w-4 h-4" /> Re-open
                                                    </Button>
                                                )}

                                                {/* <Link href={`/client/jobs/${job.id}/edit`} className="w-full">
                                                    <Button variant="secondary" size="sm" className="w-full flex justify-center items-center gap-2">
                                                        <Edit3 className="w-4 h-4" /> Edit
                                                    </Button>
                                                </Link> */}

                                                <Button variant="outline" size="sm" className="w-full flex justify-center items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleDelete(job.id)}>
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </Button>
                                            </div>
                                        </div>

                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
