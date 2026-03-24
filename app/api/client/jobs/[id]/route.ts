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
        const user = await getUser();
        if (!user || user.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jobId = (await params).id;
        const job = await prisma.job.findUnique({ where: { id: jobId } });

        if (!job || job.clientId !== user.id) {
            return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
        }

        const body = await req.json();

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: {
                ...(body.title && { title: body.title }),
                ...(body.description && { description: body.description }),
                ...(body.skills && { skills: body.skills }),
                ...(body.budget && { budget: parseFloat(body.budget) }),
                ...(body.deadline && { deadline: new Date(body.deadline) }),
                ...(body.status && { status: body.status })
            }
        });

        return NextResponse.json({ job: updatedJob }, { status: 200 });
    } catch (error) {
        console.error('Update Job Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jobId = (await params).id;
        const job = await prisma.job.findUnique({ where: { id: jobId } });

        if (!job || job.clientId !== user.id) {
            return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
        }

        await prisma.job.delete({
            where: { id: jobId }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Delete Job Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
