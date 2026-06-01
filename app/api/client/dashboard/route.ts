import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getClientDashboardData } from '@/lib/dashboard';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await getClientDashboardData(session.id);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Client dashboard error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
