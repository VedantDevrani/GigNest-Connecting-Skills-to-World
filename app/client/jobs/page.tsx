import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ClientJobsList } from './ClientJobsList';

export default async function ClientJobsPage() {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') redirect('/login');

    const jobs = await prisma.job.findMany({
        where: { clientId: session.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { proposals: true } },
        },
    });

    const initialJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        budget: job.budget,
        deadline: job.deadline.toISOString(),
        skills: job.skills,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        _count: job._count,
    }));

    return <ClientJobsList initialJobs={initialJobs} />;
}
