import React from 'react';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { User, Briefcase, Star, Calendar, ExternalLink, MessageSquare, Target } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
    if (!user) return { title: 'Profile Not Found' };
    return { title: `\${user.name} | GigNest Profile` };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            role: true,
            bio: true,
            skills: true,
            hourlyRate: true,
            createdAt: true,
            portfolios: true,
            receivedReviews: {
                include: { reviewer: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) return notFound();

    const avgRating = user.receivedReviews.length > 0
        ? user.receivedReviews.reduce((acc, rev) => acc + rev.rating, 0) / user.receivedReviews.length
        : 0;

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-950 pt-24 pb-12 px-4 sm:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 fade-in">

                {/* Back Button */}
                <Link href="/client/dashboard" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors inline-block mb-4">
                    &larr; Back to Dashboard
                </Link>

                {/* Profile Header */}
                <Card className="relative p-8 bg-white dark:bg-gray-900 border-none shadow-sm overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-gray-900 shadow-lg relative z-10">
                        <User className="w-16 h-16 md:w-20 md:h-20" />
                    </div>

                    <div className="flex-1 text-center md:text-left z-10">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                            <div>
                                <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white capitalize tracking-tight">{user.name}</h1>
                                <p className="text-primary font-medium flex items-center justify-center md:justify-start gap-2 mt-1 uppercase tracking-wider text-sm">
                                    <Briefcase className="w-4 h-4" /> {user.role}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {user.role === 'FREELANCER' && (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl text-center shadow-sm">
                                        <div className="text-xs uppercase tracking-wider font-bold mb-0.5">Hourly Rate</div>
                                        <div className="text-xl font-black">$\${user.hourlyRate || '0'}<span className="text-sm font-medium opacity-60">/hr</span></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium my-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Member since {user.createdAt.getFullYear()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 text-yellow-500"><Star className="w-4 h-4 fill-current" /> {avgRating.toFixed(1)} Rating ({user.receivedReviews.length} reviews)</span>
                        </div>

                        <div className="pt-2">
                            <Link href={`/client/messages`}>
                                <Button className="w-full md:w-auto px-8 rounded-full shadow-lg shadow-primary/20">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Request Interview
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Bio & Reviews */}
                    <div className="md:col-span-2 space-y-8">

                        <Card className="p-8 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-4">About {user.name}</h3>
                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {user.bio ? user.bio : <span className="italic opacity-50">No biography provided yet.</span>}
                            </div>
                        </Card>

                        <Card className="p-8 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-6">Client Reviews</h3>

                            {user.receivedReviews.length === 0 ? (
                                <div className="text-center py-8 opacity-50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="font-medium text-sm">No reviews yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {user.receivedReviews.map((review: any) => (
                                        <div key={review.id} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="font-bold text-gray-900 dark:text-white">{review.reviewer.name}</div>
                                                <div className="flex text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 \${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                                            <div className="text-xs text-gray-400 mt-2 font-medium">{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                    </div>

                    {/* Right Column: Skills & Portfolio */}
                    <div className="space-y-8">

                        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold font-poppins text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" /> Skills
                            </h3>
                            {user.skills && user.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill: string) => (
                                        <span key={skill} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No skills listed.</p>
                            )}
                        </Card>

                        {user.role === 'FREELANCER' && (
                            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-lg font-bold font-poppins text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" /> Portfolio
                                </h3>

                                {user.portfolios && user.portfolios.length > 0 ? (
                                    <div className="space-y-4">
                                        {user.portfolios.map((portfolio: any) => (
                                            <div key={portfolio.id} className="p-4 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-gray-800">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{portfolio.title}</h4>
                                                <p className="text-xs text-gray-500 mb-3">{portfolio.description}</p>
                                                {portfolio.projectLink && (
                                                    <a href={portfolio.projectLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                                                        View Project <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No portfolio items added.</p>
                                )}
                            </Card>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
