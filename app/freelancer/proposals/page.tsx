import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { FreelancerProposalsList } from './FreelancerProposalsList';

export default async function FreelancerProposalsPage() {
    const session = await getSession();
    if (!session || session.role !== 'FREELANCER') redirect('/login');

    const proposals = await prisma.proposal.findMany({
        where: { freelancerId: session.id },
        include: {
            job: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    client: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const initialProposals = proposals.map(p => ({
        id: p.id,
        status: p.status,
        bidAmount: p.bidAmount,
        coverLetter: p.coverLetter,
        createdAt: p.createdAt.toISOString(),
        job: p.job,
    }));

    return <FreelancerProposalsList initialProposals={initialProposals} />;
}
