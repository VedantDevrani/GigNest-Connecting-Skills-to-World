'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileCheck, Calendar, DollarSign, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await fetch('/api/client/contracts');
                if (!res.ok) throw new Error('Failed to fetch contracts');
                const data = await res.json();
                setContracts(data.contracts || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your contracts...</div>;

    return (
        <div className="space-y-6 fade-in max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">Contracts</h1>
                <p className="text-gray-500 mt-1">Manage your active and completed projects with freelancers.</p>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            {contracts.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-400">
                        <FileCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active contracts</h3>
                    <p className="text-gray-500 max-w-md mx-auto">You don't have any ongoing or completed contracts yet. Head over to the Proposal Center to hire a freelancer.</p>
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
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">{contract.job?.title || 'Unknown Job'}</h2>
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${contract.status === 'ONGOING' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                                    }`}>
                                                    {contract.status}
                                                </span>
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${contract.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {contract.paymentStatus}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium mt-4">
                                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> Freelancer: {contract.freelancer?.name}</span>
                                                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Budget: ${contract.job?.budget}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Expected: {contract.job?.deadline ? new Date(contract.job.deadline).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-center md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6 space-y-3">
                                            {contract.paymentStatus === 'UNPAID' ? (
                                                <Button
                                                    onClick={() => {
                                                        if (confirm(`Deposit $\${contract.job?.budget} into Escrow to fund this milestone?`)) {
                                                            fetch(`/api/client/contracts/\${contract.id}/fund`, { method: 'POST' })
                                                                .then(res => res.json())
                                                                .then(data => {
                                                                    if (data.contract) {
                                                                        setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, paymentStatus: 'PAID', status: 'COMPLETED' } : c));
                                                                        alert('Funds deposited successfully! Notification sent to freelancer.');
                                                                    }
                                                                });
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                                >
                                                    Deposit Funds <DollarSign className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/10 pointer-events-none">
                                                    Milestone Funded <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            )}
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
