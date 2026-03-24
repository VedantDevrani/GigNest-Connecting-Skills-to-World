import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Briefcase, CreditCard, Star, TrendingUp, Users, FileText, FileCheck, Bell } from 'lucide-react';

export default function ClientDashboardPage() {
    return (
        <div className="space-y-6 fade-in">

            {/* Welcome & Stats Row */}
            <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white mb-8">Welcome back, Client</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Jobs</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Proposals</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">14</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Contracts</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">2</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white dark:bg-gray-900 border-none shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Notifications</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">5</h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white">Recent Postings</h2>

                    {[1, 2].map((i) => (
                        <Card key={i} className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-shadow hover:shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">Senior Full-Stack Developer Needed</h4>
                                    <p className="text-sm text-gray-500 mt-1">Posted 2 days ago • Fixed Price ($1,000)</p>
                                </div>
                                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">Open</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <strong className="text-primary mr-1">15</strong> Proposals
                                </div>
                                <Button variant="secondary" size="sm">Review Proposals</Button>
                            </div>
                        </Card>
                    ))}

                    <Button className="w-full text-lg py-6 mt-4">+ Post a New Job</Button>
                </div>

                {/* Sidebar Content */}
                <div className="space-y-6">
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shrink-0">
                        <h3 className="font-bold font-poppins text-lg text-gray-900 dark:text-white mb-6">Upcoming Milestones</h3>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                                        {i}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Initial Design Hand-off</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due basically tomorrow • $250</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
}
