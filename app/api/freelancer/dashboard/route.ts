import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getFreelancerDashboardData } from '@/lib/dashboard';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await getFreelancerDashboardData(session.id);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Freelancer dashboard error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
