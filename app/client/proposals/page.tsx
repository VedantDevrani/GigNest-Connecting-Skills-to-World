import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ClientProposalsList } from './ClientProposalsList';

export default async function ClientProposalsPage() {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') redirect('/login');

    const proposals = await prisma.proposal.findMany({
        where: { job: { clientId: session.id } },
        include: {
            job: { select: { id: true, title: true, status: true } },
            freelancer: { select: { id: true, name: true, bio: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return <ClientProposalsList initialProposals={proposals} />;
}
