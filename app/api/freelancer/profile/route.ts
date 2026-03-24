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
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userToken.id },
            select: { id: true, name: true, email: true, bio: true, skills: true, hourlyRate: true, createdAt: true }
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: userToken.id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.bio !== undefined && { bio: body.bio }),
                ...(body.hourlyRate !== undefined && { hourlyRate: parseFloat(body.hourlyRate) || 0 }),
                ...(body.skills && { skills: body.skills }),
            },
            select: { id: true, name: true, email: true, bio: true, skills: true, hourlyRate: true }
        });

        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
