import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getClientDashboardData } from '@/lib/dashboard';
import { ClientDashboardView } from './ClientDashboardView';

export default async function ClientDashboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') redirect('/login');

    const data = await getClientDashboardData(session.id);

    return (
        <ClientDashboardView
            userName={data.userName}
            stats={data.stats}
            recentJobs={data.recentJobs}
            upcomingContracts={data.upcomingContracts}
        />
    );
}
