import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobSearchFilter } from './JobSearchFilter';
import { SeedButton } from './SeedButton';
import { MapPin, Clock, DollarSign, Building2, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import Image from 'next/image';

// Force dynamic since search params change
export const dynamic = 'force-dynamic';

export default async function JobsPage(props: {
    searchParams?: Promise<{ search?: string; skill?: string }>;
}) {
    const params = await props.searchParams;
    const search = params?.search;
    const skill = params?.skill;

    const whereClause: any = { status: 'OPEN' };

    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (skill) {
        whereClause.skills = { has: skill };
    }

    let jobs: any[] = [];
    try {
        jobs = await prisma.job.findMany({
            where: whereClause,
            include: {
                client: {
                    select: {
                        name: true,
                        id: true,
                    }
                },
                _count: {
                    select: { proposals: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20
        });
    } catch (e) {
        console.error("DB connection error", e);
    }

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#fafbfc] font-sans">
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Header & Search */}
                <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mb-4 tracking-tight">Find Work</h1>
                        <p className="text-gray-500 text-lg max-w-xl">Browse top-tier contract opportunities and submit your proposals to world-class clients.</p>
                    </div>

                    <div className="w-full lg:w-1/3">
                        <JobSearchFilter />
                    </div>
                </div>

                {/* Empty State / Fallback Seed Button */}
                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] text-center px-4 fade-in">
                        <div className="w-24 h-24 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">🔍</span>
                        </div>
                        <h2 className="text-3xl font-bold font-poppins text-gray-900 mb-4">No Jobs Found</h2>
                        <p className="text-gray-500 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
                            {search ? 'We couldn\'t find any jobs matching your search criteria. Try adjusting your keywords or filters.' : 'The job marketplace is currently empty. Since the backend is completely fresh, click the button below to safely inject 4 dummy job listings into the PostgreSQL database using Prisma!'}
                        </p>

                        {search ? (
                            <Link href="/jobs">
                                <Button>Clear Filters</Button>
                            </Link>
                        ) : (
                            <SeedButton />
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1 hidden lg:block">
                            <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] sticky top-24">
                                <h3 className="font-bold font-poppins text-lg text-gray-900 mb-6">Filters</h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Categories</h4>
                                        <div className="space-y-3">
                                            {['Development', 'Design & UI', 'Marketing', 'Writing'].map(cat => (
                                                <label key={cat} className="flex items-center gap-3 text-gray-500 text-sm font-medium cursor-pointer group">
                                                    <div className="w-5 h-5 rounded border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:border-primary transition-colors"></div>
                                                    {cat}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Job Type</h4>
                                        <div className="space-y-3">
                                            {['Fixed Price', 'Hourly'].map(type => (
                                                <label key={type} className="flex items-center gap-3 text-gray-500 text-sm font-medium cursor-pointer group">
                                                    <div className="w-5 h-5 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:border-primary transition-colors"></div>
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Jobs List */}
                        <div className="lg:col-span-3 space-y-5">
                            <p className="text-gray-500 font-medium mb-2 text-sm">Showing {jobs.length} results</p>

                            {jobs.map((job) => (
                                <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                                    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between gap-6">

                                        <div className="flex-1 pr-0 sm:pr-6">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-3 bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
                                                <Clock className="w-3.5 h-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                            <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <p className="text-gray-500 line-clamp-2 leading-relaxed mb-6 font-medium text-[15px]">
                                                {job.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-6 sm:mb-0">
                                                {job.skills.map((skill: string) => (
                                                    <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100 group-hover:bg-primary/5 transition-colors">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right info Sidebar */}
                                        <div className="sm:w-56 flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-gray-100 pt-6 sm:pt-0 sm:pl-6">
                                            <div className="space-y-4 mb-6">
                                                <div className="flex justify-between items-center sm:block sm:mb-2">
                                                    <span className="text-gray-400 text-xs sm:mb-1 block">Budget</span>
                                                    <span className="font-bold font-poppins text-gray-900 text-lg flex items-center gap-1">
                                                        <DollarSign className="w-5 h-5 text-gray-400" />{job.budget}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center sm:block">
                                                    <span className="text-gray-400 text-xs sm:mb-1 block">Client</span>
                                                    <span className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 border border-gray-200 font-bold">{job.client?.name.substring(0, 1) || 'A'}</span>
                                                        {job.client?.name || 'Anonymous Client'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center sm:block">
                                                    <span className="text-gray-400 text-xs sm:mb-1 block">Proposals</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex -space-x-2">
                                                            {[...Array(Math.min(3, job._count.proposals || 1))].map((_, i) => (
                                                                <Avatar key={i} src={`https://i.pravatar.cc/150?u=${i + parseInt(job.id.substring(job.id.length - 2), 16)}`} fallback="" size="sm" className="border-2 border-white pointer-events-none fade-in" />
                                                            ))}
                                                            {job._count.proposals > 3 && (
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600 z-10">
                                                                    +{job._count.proposals - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700">{job._count.proposals}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button className="w-full flex justify-between items-center">
                                                Apply <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// Inline fallback Avatar for the jobs list proposals visual
function Avatar({ src, fallback, size = 'sm', className = '' }: any) {
    return (
        <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} ${className}`}>
            {src ? <Image src={src} alt={fallback} fill className="object-cover" /> : <span className="text-xs">{fallback}</span>}
        </div>
    );
}
