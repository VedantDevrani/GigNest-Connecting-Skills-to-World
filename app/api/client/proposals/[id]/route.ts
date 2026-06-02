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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const proposalId = (await params).id;
        const body = await req.json();
        const { status } = body; // 'ACCEPTED' or 'REJECTED'

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { job: true }
        });

        if (!proposal || proposal.job.clientId !== userToken.id) {
            return NextResponse.json({ error: 'Proposal not found or unauthorized' }, { status: 404 });
        }

        if (proposal.status !== 'PENDING') {
            return NextResponse.json({ error: 'Proposal is already processed' }, { status: 400 });
        }

        // Use a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            const updatedProposal = await tx.proposal.update({
                where: { id: proposalId },
                data: { status }
            });

            if (status === 'ACCEPTED') {
                // Also create a contract
                await tx.contract.create({
                    data: {
                        jobId: proposal.jobId,
                        clientId: userToken.id,
                        freelancerId: proposal.freelancerId,
                        status: 'ONGOING',
                        paymentStatus: 'UNPAID'
                    }
                });

                // Notify freelancer
                await tx.notification.create({
                    data: {
                        userId: proposal.freelancerId,
                        type: 'PROPOSAL_ACCEPTED',
                        message: `Congratulations! Your proposal for "${proposal.job.title}" was accepted and a contract has been created.`
                    }
                });

                // Notify client
                await tx.notification.create({
                    data: {
                        userId: userToken.id,
                        type: 'CONTRACT_STARTED',
                        message: `Contract started with freelancer for "${proposal.job.title}". You can now message them.`
                    }
                });

            } else if (status === 'REJECTED') {
                // Notify freelancer
                await tx.notification.create({
                    data: {
                        userId: proposal.freelancerId,
                        type: 'PROPOSAL_REJECTED',
                        message: `Your proposal for "${proposal.job.title}" was declined by the client.`
                    }
                });
            }

            return updatedProposal;
        });

        return NextResponse.json({ proposal: result }, { status: 200 });
    } catch (error) {
        console.error('Update Proposal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
