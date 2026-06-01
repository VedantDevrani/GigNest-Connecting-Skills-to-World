'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle2, Star, DollarSign } from 'lucide-react';
import { formatEarnings } from '@/lib/dashboard-formatters';

interface FreelancerDashboardViewProps {
    userName: string;
    stats: {
        activeProposals: number;
        completedJobs: number;
        jobSuccessScore: number | null;
        totalEarned: number;
    };
    activeContracts: {
        id: string;
        jobId: string;
        jobTitle: string;
        clientName: string;
        budget: number;
        paymentStatus: string;
    }[];
    recentPendingProposals: {
        id: string;
        jobId: string;
        jobTitle: string;
        clientName: string;
        bidAmount: number;
        createdAt: string;
    }[];
}

export function FreelancerDashboardView({
    userName,
    stats,
    activeContracts,
    recentPendingProposals,
}: FreelancerDashboardViewProps) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white mb-8 capitalize">
                Welcome back, {userName}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Proposals</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeProposals}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed Jobs</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completedJobs}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Job Success Score</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.jobSuccessScore !== null ? `${stats.jobSuccessScore}%` : '—'}
                        </h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Earned</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatEarnings(stats.totalEarned)}</h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white">Active Contracts</h2>

                    {activeContracts.length === 0 ? (
                        <Card className="p-8 text-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800">
                            <p className="text-gray-500 mb-4">No active contracts right now.</p>
                            <Link href="/freelancer/jobs">
                                <Button variant="secondary">Browse Jobs</Button>
                            </Link>
                        </Card>
                    ) : (
                        activeContracts.map(contract => {
                            const progress = contract.paymentStatus === 'PAID' ? 100 : 50;
                            return (
                                <Card key={contract.id} className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-shadow hover:shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{contract.jobTitle}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {contract.clientName} • {contract.paymentStatus === 'PAID' ? 'Paid' : 'Awaiting payment'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            contract.paymentStatus === 'PAID'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                            {contract.paymentStatus === 'PAID' ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 w-full">
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>${contract.budget.toLocaleString()} contract value</span>
                                            <span>{progress}% Complete</span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}

                    <Link href="/freelancer/jobs" className="block text-center mt-6">
                        <Button variant="secondary" className="w-[80%] hover:scale-[1.02]">Browse New Jobs</Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shrink-0">
                        <h3 className="font-bold font-poppins text-lg text-gray-900 dark:text-white mb-6">Pending Proposals</h3>

                        {recentPendingProposals.length === 0 ? (
                            <p className="text-sm text-gray-500">No pending proposals. Apply to jobs to get started.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentPendingProposals.map(proposal => (
                                    <Link
                                        key={proposal.id}
                                        href={`/freelancer/jobs/${proposal.jobId}`}
                                        className="block p-3 border border-gray-100 dark:border-gray-800 rounded-xl relative hover:border-primary/30 transition-colors"
                                    >
                                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white pr-4">{proposal.jobTitle}</h4>
                                        <p className="text-xs text-gray-500 mt-1 mb-2">
                                            {proposal.clientName} • Bid ${proposal.bidAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-orange-500 font-medium">Awaiting client response</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
