'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, DollarSign, Wallet, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EarningsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>({ totalEarnings: 0, pendingEarnings: 0, completedJobs: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await fetch('/api/freelancer/earnings');
                if (!res.ok) throw new Error('Failed to fetch financial records');
                const data = await res.json();
                setContracts(data.contracts || []);
                setAnalytics(data.analytics || {});
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your earnings and contracts...</div>;

    return (
        <div className="space-y-6 fade-in max-w-5xl">

            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">Earnings & Contracts</h1>
                    <p className="text-gray-500 mt-1">Manage your active work streams and financial payouts.</p>
                </div>
                <Button>Withdraw Balance</Button>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 border-none shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Available Balance</p>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">${analytics.totalEarnings.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-primary shadow-sm">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">In Escrow (Pending)</p>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">${analytics.pendingEarnings.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-orange-500">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Jobs Paid</p>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{analytics.completedJobs}</h2>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-green-500">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Active & Past Contracts</h3>
                {contracts.length === 0 ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-primary">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No earning history</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Your contracts and payments will show up here once you start working on GigNest.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {contracts.map((contract) => (
                                <motion.div key={contract.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                    <Card className="p-6 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">{contract.job?.title || 'Unknown Job'}</h2>
                                                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full \${
                                                        contract.status === 'ONGOING' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                        {contract.status}
                                                    </span>
                                                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full \${
                                                        contract.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                                    }`}>
                                                        {contract.paymentStatus}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                    <span>Client: {contract.client?.name}</span>
                                                    <span>•</span>
                                                    <span>Milestone Amount: ${contract.job?.budget.toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>Started: {new Date(contract.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                                                <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto">
                                                    Request Payment <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>

                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

        </div>
    );
}
