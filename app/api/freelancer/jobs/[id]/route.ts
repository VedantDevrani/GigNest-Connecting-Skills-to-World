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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jobId = (await params).id;

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                client: { select: { id: true, name: true, bio: true, createdAt: true } },
                _count: { select: { proposals: true } },
                proposals: {
                    where: { freelancerId: userToken.id },
                    select: { id: true, status: true, bidAmount: true, coverLetter: true }
                }
            }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error) {
        console.error('Fetch Job Details Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
