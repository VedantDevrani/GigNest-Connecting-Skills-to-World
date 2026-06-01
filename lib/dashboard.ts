import prisma from '@/lib/prisma';

export async function getClientDashboardData(userId: string) {
    const [
        user,
        activeJobs,
        pendingProposals,
        activeContracts,
        unreadNotifications,
        recentJobs,
        upcomingContracts,
    ] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        }),
        prisma.job.count({
            where: { clientId: userId, status: 'OPEN' },
        }),
        prisma.proposal.count({
            where: { job: { clientId: userId }, status: 'PENDING' },
        }),
        prisma.contract.count({
            where: { clientId: userId, status: 'ONGOING' },
        }),
        prisma.notification.count({
            where: { userId, isRead: false },
        }),
        prisma.job.findMany({
            where: { clientId: userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { _count: { select: { proposals: true } } },
        }),
        prisma.contract.findMany({
            where: { clientId: userId, status: 'ONGOING' },
            take: 3,
            include: {
                job: { select: { title: true, deadline: true, budget: true } },
                freelancer: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    return {
        userName: user?.name ?? 'Client',
        stats: {
            activeJobs,
            pendingProposals,
            activeContracts,
            unreadNotifications,
        },
        recentJobs: recentJobs.map(job => ({
            id: job.id,
            title: job.title,
            status: job.status,
            budget: job.budget,
            createdAt: job.createdAt.toISOString(),
            proposalCount: job._count.proposals,
        })),
        upcomingContracts: upcomingContracts.map(contract => ({
            id: contract.id,
            jobTitle: contract.job.title,
            freelancerName: contract.freelancer.name,
            deadline: contract.job.deadline.toISOString(),
            budget: contract.job.budget,
            paymentStatus: contract.paymentStatus,
        })),
    };
}

export async function getFreelancerDashboardData(userId: string) {
    const [
        user,
        activeProposals,
        contracts,
        recentPendingProposals,
        activeContracts,
    ] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        }),
        prisma.proposal.count({
            where: { freelancerId: userId, status: 'PENDING' },
        }),
        prisma.contract.findMany({
            where: { freelancerId: userId },
            include: { job: { select: { budget: true } } },
        }),
        prisma.proposal.findMany({
            where: { freelancerId: userId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        client: { select: { name: true } },
                    },
                },
            },
        }),
        prisma.contract.findMany({
            where: { freelancerId: userId, status: 'ONGOING' },
            take: 3,
            include: {
                job: { select: { id: true, title: true, budget: true } },
                client: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const proposalStats = await prisma.proposal.groupBy({
        by: ['status'],
        where: {
            freelancerId: userId,
            status: { in: ['ACCEPTED', 'REJECTED'] },
        },
        _count: { status: true },
    });

    let acceptedCount = 0;
    let rejectedCount = 0;
    for (const row of proposalStats) {
        if (row.status === 'ACCEPTED') acceptedCount = row._count.status;
        if (row.status === 'REJECTED') rejectedCount = row._count.status;
    }

    const resolvedTotal = acceptedCount + rejectedCount;
    const jobSuccessScore = resolvedTotal > 0
        ? Math.round((acceptedCount / resolvedTotal) * 100)
        : null;

    let totalEarned = 0;
    let completedJobs = 0;
    for (const contract of contracts) {
        if (contract.paymentStatus === 'PAID') {
            totalEarned += contract.job.budget;
            completedJobs++;
        }
    }

    return {
        userName: user?.name ?? 'Freelancer',
        stats: {
            activeProposals,
            completedJobs,
            jobSuccessScore,
            totalEarned,
        },
        activeContracts: activeContracts.map(contract => ({
            id: contract.id,
            jobId: contract.job.id,
            jobTitle: contract.job.title,
            clientName: contract.client.name,
            budget: contract.job.budget,
            paymentStatus: contract.paymentStatus,
        })),
        recentPendingProposals: recentPendingProposals.map(proposal => ({
            id: proposal.id,
            jobId: proposal.job.id,
            jobTitle: proposal.job.title,
            clientName: proposal.job.client.name,
            bidAmount: proposal.bidAmount,
            createdAt: proposal.createdAt.toISOString(),
        })),
    };
}
