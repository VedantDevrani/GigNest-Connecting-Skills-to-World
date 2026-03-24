import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function GET(req: NextRequest) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const contracts = await prisma.contract.findMany({
            where: { freelancerId: userToken.id },
            include: {
                job: {
                    select: { id: true, title: true, budget: true, deadline: true }
                },
                client: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Basic aggregation logic inside JS for simple reporting
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

        return NextResponse.json({
            contracts,
            analytics: { totalEarnings, pendingEarnings, completedJobs }
        });
    } catch (error) {
        console.error('Fetch Earnings Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
