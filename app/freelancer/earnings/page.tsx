import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { FreelancerEarningsView } from './FreelancerEarningsView';

export default async function EarningsPage() {
    const session = await getSession();
    if (!session || session.role !== 'FREELANCER') redirect('/login');

    const contracts = await prisma.contract.findMany({
        where: { freelancerId: session.id },
        include: {
            job: { select: { id: true, title: true, budget: true, deadline: true } },
            client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    let totalEarnings = 0;
    let pendingEarnings = 0;
    let completedJobs = 0;

    contracts.forEach(c => {
        if (c.paymentStatus === 'PAID') {
            totalEarnings += c.job.budget;
            completedJobs++;
        } else if (c.paymentStatus === 'UNPAID') {
            pendingEarnings += c.job.budget;
        }
    });

    const initialContracts = contracts.map(c => ({
        id: c.id,
        status: c.status,
        paymentStatus: c.paymentStatus,
        createdAt: c.createdAt.toISOString(),
        job: c.job ? { ...c.job, deadline: c.job.deadline.toISOString() } : undefined,
        client: c.client,
    }));

    return (
        <FreelancerEarningsView
            initialContracts={initialContracts}
            analytics={{ totalEarnings, pendingEarnings, completedJobs }}
        />
    );
}
