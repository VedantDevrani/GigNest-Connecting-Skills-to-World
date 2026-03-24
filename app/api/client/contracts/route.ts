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

export async function GET() {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const contracts = await prisma.contract.findMany({
            where: { clientId: userToken.id },
            include: {
                job: {
                    select: { id: true, title: true, budget: true, deadline: true }
                },
                freelancer: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ contracts });
    } catch (error) {
        console.error('Fetch Contracts Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
