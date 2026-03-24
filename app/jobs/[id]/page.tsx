import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, DollarSign, Building2, Calendar, Share2, Flag, ArrowLeft } from 'lucide-react';

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    _count: {
                        select: { clientJobs: true, givenReviews: true }
                    }
                }
            },
            _count: {
                select: { proposals: true }
            }
        }
    });

    if (!job) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#fafbfc] font-sans">
            <div className="max-w-[1000px] mx-auto px-6">

                {/* Top Nav */}
                <div className="mb-6">
                    <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search Results
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content Column */}
                    <div className="flex-1 bg-white rounded-[24px] border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] overflow-hidden">

                        {/* Header Area */}
                        <div className="p-8 border-b border-gray-100">
                            <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-4">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100"><Clock className="w-3.5 h-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100"><MapPin className="w-3.5 h-3.5" /> Worldwide</span>
                            </div>
                        </div>

                        {/* Description Area */}
                        <div className="p-8 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Job Description</h3>
                            <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap font-medium text-[15px]">
                                {job.description}
                            </div>
                        </div>

                        {/* Skills Area */}
                        <div className="p-8 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map(skill => (
                                    <span key={skill} className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="p-8">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Activity on this job</h3>
                            <div className="text-sm font-medium text-gray-600">
                                Proposals submitted: <span className="text-gray-900 ml-2">{job._count.proposals}</span>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:w-[320px] space-y-6">

                        {/* Apply Box */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] p-6">
                            <Button className="w-full text-lg py-6 mb-4 shadow-md shadow-primary/20">Apply Now</Button>
                            <Button variant="secondary" className="w-full mb-6">Save Job</Button>

                            <div className="flex justify-between items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer px-2">
                                <div className="flex items-center gap-2"><Flag className="w-4 h-4" /> Flag as inappropriate</div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] p-6 space-y-6">
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-2"><DollarSign className="w-5 h-5 text-gray-400" /> ${job.budget} Fixed</h4>
                                <p className="text-xs text-gray-500 font-medium ml-7">Estimated Budget</p>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-2"><Calendar className="w-5 h-5 text-gray-400" /> {new Date(job.deadline).toLocaleDateString()}</h4>
                                <p className="text-xs text-gray-500 font-medium ml-7">Project Deadline</p>
                            </div>
                        </div>

                        {/* Client Box */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] p-6">
                            <h3 className="font-bold text-gray-900 mb-6 font-poppins border-b border-gray-100 pb-4">About the Client</h3>

                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                                        {job.client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{job.client.name}</h4>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Member since {new Date(job.client.createdAt).getFullYear()}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Jobs Posted</span>
                                        <span className="font-bold text-gray-900">{job.client._count.clientJobs}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Total Reviews</span>
                                        <span className="font-bold text-gray-900">{job.client._count.givenReviews}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share link */}
                        <div className="text-center pt-2">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 cursor-pointer transition-colors">
                                <Share2 className="w-4 h-4" /> Copy link to share
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
