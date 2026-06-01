import { NextResponse } from 'next/server';
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
 * GET /api/chat/conversations
 *
 * Returns all conversations for the authenticated user.
 * A conversation is auto-created for every ONGOING contract
 * the user is a participant in. Only ONGOING contracts generate
 * visible conversations — no manual chat creation needed.
 */
export async function GET() {
    const userToken = await getUser();
    if (!userToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find all ONGOING contracts for this user (as client or freelancer)
        const ongoingContracts = await prisma.contract.findMany({
            where: {
                status: 'ONGOING',
                OR: [
                    { clientId: userToken.id },
                    { freelancerId: userToken.id },
                ],
            },
            include: {
                client: { select: { id: true, name: true } },
                freelancer: { select: { id: true, name: true } },
                job: { select: { title: true } },
            },
        });

        // For each ONGOING contract, upsert a Conversation (create if not exists)
        const conversationPromises = ongoingContracts.map((contract: any) =>
            prisma.conversation.upsert({
                where: { contractId: contract.id },
                create: {
                    contractId: contract.id,
                    clientId: contract.clientId,
                    freelancerId: contract.freelancerId,
                },
                update: {}, // no-op if already exists
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: { content: true, createdAt: true, senderId: true, isRead: true },
                    },
                    client: { select: { id: true, name: true } },
                    freelancer: { select: { id: true, name: true } },
                    contract: { select: { status: true, job: { select: { title: true } } } },
                },
            })
        );

        const conversations = await Promise.all(conversationPromises);

        // Build a clean response — expose "other party" name + last message + unread count
        const resultRaw = await Promise.all(
            conversations.map(async (conv) => {
                const isClient = conv.clientId === userToken.id;
                const otherParty = isClient ? conv.freelancer : conv.client;

                // Skip conversations where the other user no longer exists
                if (!otherParty) return null;

                const lastMsg = conv.messages[0] ?? null;

                // Count unread messages sent by the other party
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userToken.id },
                        isRead: false,
                    },
                });

                return {
                    id: conv.id,
                    contractId: conv.contractId,
                    jobTitle: conv.contract.job.title,
                    contractStatus: conv.contract.status,
                    otherParty,
                    lastMessage: lastMsg
                        ? {
                            content: lastMsg.content,
                            createdAt: lastMsg.createdAt,
                            isFromMe: lastMsg.senderId === userToken.id,
                        }
                        : null,
                    unreadCount,
                    updatedAt: conv.updatedAt,
                };
            })
        );

        // Filter out nulls (conversations with missing users)
        const result = resultRaw.filter((r) => r !== null);

        // Sort by most recent activity
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        const response = NextResponse.json({ conversations: result, currentUserId: userToken.id });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;
    } catch (error) {
        console.error('[GET /api/chat/conversations] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
