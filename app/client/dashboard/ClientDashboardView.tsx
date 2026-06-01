'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Briefcase, FileText, FileCheck, Bell } from 'lucide-react';
import { formatDueDate, formatRelativeDate } from '@/lib/dashboard-formatters';

interface ClientDashboardViewProps {
    userName: string;
    stats: {
        activeJobs: number;
        pendingProposals: number;
        activeContracts: number;
        unreadNotifications: number;
    };
    recentJobs: {
        id: string;
        title: string;
        status: string;
        budget: number;
        createdAt: string;
        proposalCount: number;
    }[];
    upcomingContracts: {
        id: string;
        jobTitle: string;
        freelancerName: string;
        deadline: string;
        budget: number;
        paymentStatus: string;
    }[];
}

export function ClientDashboardView({
    userName,
    stats,
    recentJobs,
    upcomingContracts,
}: ClientDashboardViewProps) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white mb-8 capitalize">
                Welcome back, {userName}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Jobs</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeJobs}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Proposals</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingProposals}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Contracts</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeContracts}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Unread Notifications</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.unreadNotifications}</h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white">Recent Postings</h2>

                    {recentJobs.length === 0 ? (
                        <Card className="p-8 text-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800">
                            <p className="text-gray-500 mb-4">You haven&apos;t posted any jobs yet.</p>
                            <Link href="/client/jobs/create">
                                <Button>Post Your First Job</Button>
                            </Link>
                        </Card>
                    ) : (
                        recentJobs.map(job => (
                            <Card key={job.id} className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-shadow hover:shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{job.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatRelativeDate(job.createdAt)} • Fixed Price (${job.budget.toLocaleString()})
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        job.status === 'OPEN'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {job.status === 'OPEN' ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <strong className="text-primary mr-1">{job.proposalCount}</strong>
                                        Proposal{job.proposalCount !== 1 ? 's' : ''}
                                    </div>
                                    <Link href="/client/proposals">
                                        <Button variant="secondary" size="sm">Review Proposals</Button>
                                    </Link>
                                </div>
                            </Card>
                        ))
                    )}

                    <Link href="/client/jobs/create" className="block">
                        <Button className="w-full text-lg py-6 mt-4">+ Post a New Job</Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shrink-0">
                        <h3 className="font-bold font-poppins text-lg text-gray-900 dark:text-white mb-6">Active Contract Deadlines</h3>
                        {upcomingContracts.length === 0 ? (
                            <p className="text-sm text-gray-500">No active contracts with upcoming deadlines.</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingContracts.map((contract, i) => (
                                    <div key={contract.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{contract.jobTitle}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {contract.freelancerName} • {formatDueDate(contract.deadline)} • ${contract.budget.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 capitalize">{contract.paymentStatus.toLowerCase()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
