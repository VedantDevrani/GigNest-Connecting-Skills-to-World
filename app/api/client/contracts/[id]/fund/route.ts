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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const contractId = (await params).id;

        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            include: { job: true }
        });

        if (!contract || contract.clientId !== userToken.id) {
            return NextResponse.json({ error: 'Contract not found or unauthorized' }, { status: 404 });
        }

        if (contract.paymentStatus === 'PAID') {
            return NextResponse.json({ error: 'Contract is already paid' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.contract.update({
                where: { id: contractId },
                data: {
                    paymentStatus: 'PAID',
                    status: 'COMPLETED'
                }
            });

            // Notify freelancer
            await tx.notification.create({
                data: {
                    userId: contract.freelancerId,
                    type: 'CONTRACT_COMPLETED',
                    message: `Client has deposited funds. Your contract for "\${contract.job.title}" is PAID and COMPLETED.`
                }
            });

            return updated;
        });

        return NextResponse.json({ contract: result }, { status: 200 });
    } catch (error) {
        console.error('Fund Contract Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
