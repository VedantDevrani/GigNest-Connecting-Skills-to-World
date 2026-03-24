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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const proposalId = (await params).id;

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId }
        });

        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.freelancerId !== userToken.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (proposal.status !== 'PENDING') {
            return NextResponse.json({ error: 'Can only withdraw pending proposals' }, { status: 400 });
        }

        await prisma.proposal.delete({
            where: { id: proposalId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Proposal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
