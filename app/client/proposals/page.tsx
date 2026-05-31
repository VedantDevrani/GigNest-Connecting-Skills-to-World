'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle, XCircle, DollarSign, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Proposal {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    bidAmount: number;
    coverLetter: string;
    job: { id: string; title: string; status: string };
    freelancer: { id: string; name: string; bio?: string };
}

export default function ClientProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    // Track which proposal is pending inline confirmation
    const [confirmingId, setConfirmingId] = useState<{ id: string; action: 'ACCEPTED' | 'REJECTED' } | null>(null);

    const fetchProposals = async () => {
        try {
            const res = await fetch(`/api/client/proposals?t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch proposals');
            const data = await res.json();
            setProposals(data.proposals || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    const handleAction = async (id: string, action: 'ACCEPTED' | 'REJECTED') => {
        setConfirmingId(null);
        setProcessing(id);

        try {
            const res = await fetch(`/api/client/proposals/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${action.toLowerCase()} proposal`);
            }

            // Refresh proposals to reflect the new status
            await fetchProposals();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading incoming proposals...</div>;

    return (
        <div className="space-y-6 fade-in max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">Proposal Center</h1>
                <p className="text-gray-500 mt-1">Review, accept, or dismiss proposals sent by freelancers.</p>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {proposals.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 text-orange-400">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No proposals yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">No freelancers have applied to your active jobs yet.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {proposals.map((prop) => {
                            const isPending = prop.status === 'PENDING';
                            const isConfirming = confirmingId?.id === prop.id;
                            const isProcessing = processing === prop.id;

                            return (
                                <motion.div key={prop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                    <Card className={`p-6 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800 ${!isPending ? 'opacity-75' : ''}`}>
                                        <div className="flex flex-col md:flex-row justify-between gap-6">

                                            {/* Left — Proposal Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">{prop.job.title}</h2>
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                        prop.status === 'PENDING'
                                                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                                                            : prop.status === 'ACCEPTED'
                                                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
                                                            : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                                                    }`}>
                                                        {prop.status}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
                                                    <Link
                                                        href={`/profile/${prop.freelancer.id}`}
                                                        className="hover:underline flex items-center gap-1 font-bold text-primary"
                                                    >
                                                        <User className="w-4 h-4" /> {prop.freelancer.name}
                                                    </Link>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-primary" /> Bid: ${prop.bidAmount}
                                                    </span>
                                                </div>

                                                <div className="bg-gray-50 dark:bg-[#111827] p-4 rounded-xl border border-gray-100 dark:border-gray-800/50">
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap italic">&ldquo;{prop.coverLetter}&rdquo;</p>
                                                </div>
                                            </div>

                                            {/* Right — Actions */}
                                            <div className="flex md:flex-col justify-end gap-3 md:min-w-[160px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                                                {isPending ? (
                                                    isConfirming ? (
                                                        /* Inline confirmation — no browser dialog needed */
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                                                                {confirmingId?.action === 'ACCEPTED' ? '✅ Accept this proposal?' : '❌ Reject this proposal?'}
                                                            </p>
                                                            <Button
                                                                className={`w-full flex justify-center items-center gap-2 ${
                                                                    confirmingId?.action === 'ACCEPTED'
                                                                        ? 'bg-green-500 hover:bg-green-600'
                                                                        : 'bg-red-500 hover:bg-red-600'
                                                                }`}
                                                                onClick={() => handleAction(prop.id, confirmingId!.action)}
                                                                disabled={isProcessing}
                                                            >
                                                                {isProcessing ? 'Processing...' : 'Yes, confirm'}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full flex justify-center items-center gap-2"
                                                                onClick={() => setConfirmingId(null)}
                                                                disabled={isProcessing}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        /* Normal Accept / Reject buttons */
                                                        <>
                                                            <Button
                                                                className="w-full bg-green-500 hover:bg-green-600 focus:ring-green-500 flex justify-center items-center gap-2"
                                                                onClick={() => setConfirmingId({ id: prop.id, action: 'ACCEPTED' })}
                                                                disabled={isProcessing}
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Accept
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-200 dark:border-red-900/30 flex justify-center items-center gap-2"
                                                                onClick={() => setConfirmingId({ id: prop.id, action: 'REJECTED' })}
                                                                disabled={isProcessing}
                                                            >
                                                                <XCircle className="w-4 h-4" /> Reject
                                                            </Button>
                                                        </>
                                                    )
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className={`text-sm font-bold flex items-center gap-2 ${
                                                            prop.status === 'ACCEPTED' ? 'text-green-600' : 'text-red-500'
                                                        }`}>
                                                            {prop.status === 'ACCEPTED'
                                                                ? <><CheckCircle className="w-4 h-4" /> Accepted</>
                                                                : <><XCircle className="w-4 h-4" /> Rejected</>
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
