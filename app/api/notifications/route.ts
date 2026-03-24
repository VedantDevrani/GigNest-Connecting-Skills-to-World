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
    const userToken = await getUser();
    if (!userToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: userToken.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const userToken = await getUser();
    if (!userToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();

        if (id) {
            // Mark specific as read
            await prisma.notification.updateMany({
                where: { id, userId: userToken.id },
                data: { isRead: true }
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: userToken.id, isRead: false },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Notifications Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
