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

/**
 * Verify that the user is a participant in the conversation.
 * Returns the conversation record or null if not authorized.
 */
async function getAuthorizedConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            contract: { select: { status: true } },
        },
    });

    if (!conversation) return null;
    if (conversation.clientId !== userId && conversation.freelancerId !== userId) return null;

    return conversation;
}

/**
 * GET /api/chat/conversations/[id]/messages
 *
 * Fetch message history for a specific conversation.
 * User must be a participant (derived from the contract) — no exceptions.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userToken = await getUser();
    if (!userToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    const conversation = await getAuthorizedConversation(conversationId, userToken.id);
    if (!conversation) {
        return NextResponse.json(
            { error: 'Conversation not found or access denied' },
            { status: 403 }
        );
    }

    try {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Mark messages from the other party as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userToken.id },
                isRead: false,
            },
            data: { isRead: true },
        });

        const response = NextResponse.json({ messages, currentUserId: userToken.id });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;
    } catch (error) {
        console.error('[GET /api/chat/conversations/[id]/messages] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/chat/conversations/[id]/messages
 *
 * HTTP fallback for sending a message (primary send path is via Socket.IO).
 * Enforces:
 *   1. User must be a participant.
 *   2. The contract must still be ONGOING.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userToken = await getUser();
    if (!userToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    const conversation = await getAuthorizedConversation(conversationId, userToken.id);
    if (!conversation) {
        return NextResponse.json(
            { error: 'Conversation not found or access denied' },
            { status: 403 }
        );
    }

    // Block sending if contract is no longer active
    if (conversation.contract.status !== 'ONGOING') {
        return NextResponse.json(
            { error: 'Cannot send messages — the contract is no longer active' },
            { status: 403 }
        );
    }

    try {
        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userToken.id,
                content: content.trim(),
            },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Update conversation updatedAt for sidebar ordering
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/chat/conversations/[id]/messages] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
