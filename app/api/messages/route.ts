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
    const userToken = await getUser();
    if (!userToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contactId = req.nextUrl.searchParams.get('contactId');
    if (!contactId || contactId === 'undefined') {
        return NextResponse.json({ error: 'Missing contactId' }, { status: 400 });
    }

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userToken.id, receiverId: contactId },
                    { senderId: contactId, receiverId: userToken.id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // Add robust caching headers to strictly forbid caching in all Next.js versions
        const response = NextResponse.json({ messages });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Fetch Messages Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const userToken = await getUser();
    if (!userToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { receiverId, content } = await req.json();

        if (!receiverId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                senderId: userToken.id,
                receiverId,
                content
            }
        });

        try {
            const sender = await prisma.user.findUnique({ where: { id: userToken.id } });
            // Add a notification for the receiver
            await prisma.notification.create({
                data: {
                    userId: receiverId,
                    type: 'MESSAGE',
                    message: `You have a new message from \${sender?.name || 'someone'}`
                }
            });
        } catch (notifErr) {
            console.error('Notification failed but message sent:', notifErr);
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
