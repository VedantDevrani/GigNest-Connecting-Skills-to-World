import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const user1 = "cmm92equo0001ilegftz4ctio"; // client1
    const user2 = "cmm92ctaj0000ilego0jlzqgh"; // Lakshya

    const url = new URL(req.url);
    const u1 = url.searchParams.get('u1') || user1;
    const u2 = url.searchParams.get('u2') || user2;

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: u1, receiverId: u2 },
                { senderId: u2, receiverId: u1 }
            ]
        },
        orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
        u1,
        u2,
        found_length: messages.length,
        messages
    });
}
