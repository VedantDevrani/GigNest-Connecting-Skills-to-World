import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

        const proposals = await prisma.proposal.findMany({
            where: {
                job: {
                    clientId: userToken.id
                }
            },
            include: {
                job: {
                    select: { id: true, title: true, status: true }
                },
                freelancer: {
                    select: { id: true, name: true, bio: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const response = NextResponse.json({ proposals });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Fetch Proposals Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
