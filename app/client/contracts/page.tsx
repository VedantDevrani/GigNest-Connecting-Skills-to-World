import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ClientContractsList } from './ClientContractsList';

export default async function ClientContractsPage() {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') redirect('/login');

    const contracts = await prisma.contract.findMany({
        where: { clientId: session.id },
        include: {
            job: { select: { id: true, title: true, budget: true, deadline: true } },
            freelancer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const initialContracts = contracts.map(c => ({
        id: c.id,
        status: c.status,
        paymentStatus: c.paymentStatus,
        job: c.job ? { ...c.job, deadline: c.job.deadline.toISOString() } : undefined,
        freelancer: c.freelancer,
    }));

    return <ClientContractsList initialContracts={initialContracts} />;
}
