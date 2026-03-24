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

export async function GET(req: NextRequest) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const proposals = await prisma.proposal.findMany({
            where: { freelancerId: userToken.id },
            include: {
                job: {
                    select: { id: true, title: true, budget: true, status: true, client: { select: { name: true } } }
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

export async function POST(req: NextRequest) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { jobId, coverLetter, bidAmount } = body;

        if (!jobId || !coverLetter || !bidAmount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if job exists and is OPEN
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        if (job.status !== 'OPEN') return NextResponse.json({ error: 'Job is no longer open' }, { status: 400 });

        // Check if already applied
        const existing = await prisma.proposal.findFirst({
            where: { jobId, freelancerId: userToken.id }
        });

        if (existing) {
            return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 400 });
        }

        const proposal = await prisma.proposal.create({
            data: {
                jobId,
                freelancerId: userToken.id,
                coverLetter,
                bidAmount: parseFloat(bidAmount),
                status: 'PENDING'
            }
        });

        // Notify the client
        await prisma.notification.create({
            data: {
                userId: job.clientId,
                type: 'PROPOSAL_RECEIVED',
                message: `You received a new proposal for your job: \${job.title}`
            }
        });

        return NextResponse.json({ proposal }, { status: 201 });
    } catch (error) {
        console.error('Submit Proposal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
