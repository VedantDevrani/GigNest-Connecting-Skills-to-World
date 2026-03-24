'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Clock, CheckCircle, XCircle, DollarSign, Building2, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function FreelancerProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchProposals = async () => {
        try {
            const res = await fetch(`/api/freelancer/proposals?t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch proposals');
            const data = await res.json();
            setProposals(data.proposals || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    const handleWithdraw = async (id: string) => {
        if (!confirm('Are you sure you want to withdraw this proposal?')) return;
        setActionLoading(id);

        try {
            const res = await fetch(`/api/freelancer/proposals/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to withdraw proposal');
            await fetchProposals();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your proposals...</div>;

    return (
        <div className="space-y-6 fade-in max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">My Proposals</h1>
                <p className="text-gray-500 mt-1">Track the status of your submitted bids and active applications.</p>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            {proposals.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800 shadow-none">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active proposals</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't applied to any jobs yet. Start searching for perfectly matched projects to send your first bid.</p>
                    <Link href="/freelancer/jobs">
                        <Button>Find Work <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {proposals.map((prop) => (
                            <motion.div key={prop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <Card className={`p-6 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800 \${prop.status === 'REJECTED' ? 'opacity-60 grayscale' : ''}`}>
                                    <div className="flex flex-col md:flex-row justify-between gap-6">

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link href={`/freelancer/jobs/\${prop.job.id}`} className="hover:underline">
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">{prop.job.title}</h2>
                                                </Link>
                                                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full \${
                                                    prop.status === 'PENDING' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' : 
                                                    prop.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                                                    'bg-red-50 text-red-600 dark:bg-red-900/20'
                                                }`}>
                                                    {prop.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
                                                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Client: {prop.job.client?.name}</span>
                                                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-primary" /> Your Bid: $\${prop.bidAmount}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Submitted {new Date(prop.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {prop.status === 'ACCEPTED' && (
                                                <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium mb-2 border border-green-100 dark:border-green-900/30">
                                                    <CheckCircle className="w-4 h-4" /> Great news! The client accepted your bid and a contract was created.
                                                </div>
                                            )}

                                            {prop.status === 'REJECTED' && (
                                                <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium mb-2 border border-red-100 dark:border-red-900/30">
                                                    <XCircle className="w-4 h-4" /> The client has chosen another freelancer or closed the job.
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col justify-end gap-3 md:min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                                            <Link href={`/freelancer/jobs/\${prop.job.id}`} className="w-full">
                                                <Button variant="outline" className="w-full">View Details</Button>
                                            </Link>

                                            {prop.status === 'PENDING' && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-200 dark:border-red-900/30"
                                                    onClick={() => handleWithdraw(prop.id)}
                                                    disabled={actionLoading === prop.id}
                                                >
                                                    {actionLoading === prop.id ? 'Withdrawing...' : (
                                                        <><Trash2 className="w-4 h-4 mr-2" /> Withdraw</>
                                                    )}
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
