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
        const user = await getUser();
        if (!user || user.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jobs = await prisma.job.findMany({
            where: { clientId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { proposals: true }
                }
            }
        });

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error('Fetch Jobs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, skills, budget, deadline } = body;

        if (!title || !description || !budget || !deadline) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const job = await prisma.job.create({
            data: {
                title,
                description,
                skills: skills || [],
                budget: parseFloat(budget),
                deadline: new Date(deadline),
                clientId: user.id,
                status: 'OPEN'
            }
        });

        return NextResponse.json({ job }, { status: 201 });
    } catch (error) {
        console.error('Create Job Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
