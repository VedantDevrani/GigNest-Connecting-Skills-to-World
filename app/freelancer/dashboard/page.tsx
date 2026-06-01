import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getFreelancerDashboardData } from '@/lib/dashboard';
import { FreelancerDashboardView } from './FreelancerDashboardView';

export default async function FreelancerDashboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'FREELANCER') redirect('/login');

    const data = await getFreelancerDashboardData(session.id);

    return (
        <FreelancerDashboardView
            userName={data.userName}
            stats={data.stats}
            activeContracts={data.activeContracts}
            recentPendingProposals={data.recentPendingProposals}
        />
    );
}
