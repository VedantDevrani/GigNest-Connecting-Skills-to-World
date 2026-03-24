'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Calendar, User, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailsPage() {
    const params = useParams();
    const jobId = params?.id as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [coverLetter, setCoverLetter] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState(false);

    const fetchJob = useCallback(async () => {
        if (!jobId) return;
        try {
            const res = await fetch(`/api/freelancer/jobs/${jobId}`);
            if (!res.ok) throw new Error('Failed to load job details');
            const data = await res.json();
            setJob(data.job);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        if (jobId) {
            fetchJob();
        }
    }, [jobId, fetchJob]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess(false);

        try {
            const res = await fetch('/api/freelancer/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    coverLetter,
                    bidAmount
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit proposal');

            setFormSuccess(true);
            await fetchJob(); // Re-fetch to get updated proposal status
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    const handleWithdraw = async (proposalId: string) => {
        if (!confirm('Are you sure you want to withdraw this proposal?')) return;
        setFormLoading(true);
        try {
            const res = await fetch(`/api/freelancer/proposals/${proposalId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to withdraw proposal');

            // Re-fetch to show application form again
            await fetchJob();
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading job details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!job) return <div className="p-8 text-center text-gray-500">Job not found.</div>;

    const myProposal = job.proposals?.[0];

    return (
        <div className="space-y-6 fade-in max-w-5xl mx-auto">

            <Link href="/freelancer/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Search
            </Link>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Column: Job Details */}
                <div className="flex-1 w-full space-y-6">
                    <Card className="p-8 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white mb-4">{job.title}</h1>

                            <div className="flex flex-wrap items-center gap-6">
                                <span className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-full">
                                    <DollarSign className="w-4 h-4 text-primary" /> ${job.budget} Budget
                                </span>
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <Calendar className="w-4 h-4" /> Due {new Date(job.deadline).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <Clock className="w-4 h-4" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins mb-2">Project Description</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-8">
                                {job.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins mb-3">Skills & Expertise Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill: string) => (
                                    <span key={skill} className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Apply Form or Status */}
                <div className="w-full lg:w-[400px] shrink-0 space-y-6">

                    {/* Client Info Widget */}
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white font-poppins mb-4">About the Client</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{job.client.name}</p>
                                <p className="text-xs text-gray-500">Member since {new Date(job.client.createdAt).getFullYear()}</p>
                            </div>
                        </div>
                        {job.client.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">&quot;{job.client.bio}&quot;</p>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500">
                            {job._count.proposals} freelancers have bid on this job
                        </div>
                    </Card>

                    {/* Submit Proposal Form */}
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                        {myProposal ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Proposal Submitted!</h3>
                                    <p className="text-sm text-gray-500 mt-1">You bid <strong>${myProposal.bidAmount}</strong> on this project.</p>
                                </div>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold \${
                                    myProposal.status === 'PENDING' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' : 
                                    myProposal.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 
                                    'bg-red-50 text-red-600 dark:bg-red-900/20'
                                }`}>
                                    Status: {myProposal.status}
                                </div>

                                {myProposal.status === 'PENDING' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleWithdraw(myProposal.id)}
                                        disabled={formLoading}
                                        className="w-full mt-4 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                    >
                                        {formLoading ? 'Withdrawing...' : 'Withdraw Proposal'}
                                    </Button>
                                )}
                            </div>
                        ) : job.status !== 'OPEN' ? (
                            <div className="text-center py-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins mb-1">Job Closed</h3>
                                <p className="text-sm text-gray-500">This job is no longer accepting proposals.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins border-b border-gray-100 dark:border-gray-800 pb-3 mb-2">Submit a Proposal</h3>

                                {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                                {formSuccess && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">Proposal sent successfully!</div>}

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Bid Amount ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            required
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            placeholder="e.g. 250"
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Client budget is ${job.budget}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cover Letter</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder="Hi there! I believe I am the perfect fit for this project because..."
                                        className="w-full p-4 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={formLoading}>
                                    {formLoading ? 'Submitting...' : 'Send Proposal'}
                                </Button>
                            </form>
                        )}
                    </Card>

                </div>
            </div>
        </div>
    );
}
