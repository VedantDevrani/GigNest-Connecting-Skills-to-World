import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import * as cookie from 'cookie';

export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Checks whether the given userId is a participant (clientId or freelancerId)
 * in the specified conversation AND that the linked contract is ONGOING.
 */
async function isAuthorizedParticipant(userId: string, conversationId: string): Promise<boolean> {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { contract: { select: { status: true } } },
    });

    if (!conversation) return false;
    if (conversation.clientId !== userId && conversation.freelancerId !== userId) return false;
    if (conversation.contract.status !== 'ONGOING') return false;

    return true;
}

const ioHandler = (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        const httpServer: NetServer = res.socket.server as any;

        const io = new ServerIO(httpServer, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        // ── Authentication Middleware ──────────────────────────────────────────
        io.use(async (socket, next) => {
            try {
                const cookies = cookie.parse(socket.request.headers.cookie || '');
                const token = cookies.token;

                if (!token) return next(new Error('Authentication error: no token'));

                const payload = await verifyToken(token);
                if (!payload?.id) return next(new Error('Authentication error: invalid token'));

                (socket as any).userId = payload.id;
                next();
            } catch {
                next(new Error('Authentication error'));
            }
        });

        // ── Connection Handler ────────────────────────────────────────────────
        io.on('connection', (socket) => {
            const userId = (socket as any).userId as string;

            // Each user joins a personal room for receiving directed messages
            socket.join(`user:${userId}`);

            // ── Join a Conversation Room ────────────────────────────────────
            socket.on('joinConversation', async (conversationId: string) => {
                const authorized = await isAuthorizedParticipant(userId, conversationId);
                if (!authorized) {
                    socket.emit('error', { message: 'Not authorized to join this conversation' });
                    return;
                }
                socket.join(`conv:${conversationId}`);
            });

            // ── Send Message ────────────────────────────────────────────────
            socket.on('sendMessage', async ({ conversationId, content }: { conversationId: string; content: string }) => {
                if (!conversationId || !content?.trim()) return;

                // Re-validate every send — no trusting client state
                const authorized = await isAuthorizedParticipant(userId, conversationId);
                if (!authorized) {
                    socket.emit('error', { message: 'You are not authorized to send messages in this conversation' });
                    return;
                }

                try {
                    const message = await prisma.message.create({
                        data: {
                            conversationId,
                            senderId: userId,
                            content: content.trim(),
                        },
                        include: {
                            sender: { select: { id: true, name: true } },
                        },
                    });

                    // Update conversation updatedAt so sidebar orders correctly
                    await prisma.conversation.update({
                        where: { id: conversationId },
                        data: { updatedAt: new Date() },
                    });

                    // Broadcast to all sockets in the conversation room
                    io.to(`conv:${conversationId}`).emit('receiveMessage', message);

                    // Send a notification to the other participant
                    const conversation = await prisma.conversation.findUnique({
                        where: { id: conversationId },
                        select: { clientId: true, freelancerId: true },
                    });
                    if (conversation) {
                        const recipientId =
                            conversation.clientId === userId
                                ? conversation.freelancerId
                                : conversation.clientId;

                        try {
                            const sender = await prisma.user.findUnique({
                                where: { id: userId },
                                select: { name: true },
                            });
                            await prisma.notification.create({
                                data: {
                                    userId: recipientId,
                                    type: 'MESSAGE',
                                    message: `New message from ${sender?.name || 'someone'}`,
                                },
                            });
                        } catch {
                            // Notification failure must not affect message delivery
                        }
                    }
                } catch (error) {
                    console.error('[Socket] sendMessage error:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // ── Mark Messages as Read ───────────────────────────────────────
            socket.on('markAsRead', async ({ conversationId }: { conversationId: string }) => {
                if (!conversationId) return;

                const authorized = await isAuthorizedParticipant(userId, conversationId);
                if (!authorized) return;

                try {
                    await prisma.message.updateMany({
                        where: {
                            conversationId,
                            senderId: { not: userId },
                            isRead: false,
                        },
                        data: { isRead: true },
                    });

                    // Notify the other participant that their messages were read
                    io.to(`conv:${conversationId}`).emit('messagesRead', { conversationId });
                } catch (error) {
                    console.error('[Socket] markAsRead error:', error);
                }
            });

            // ── Typing Indicators ───────────────────────────────────────────
            socket.on('typing', ({ conversationId }: { conversationId: string }) => {
                if (conversationId) {
                    socket.to(`conv:${conversationId}`).emit('userTyping', { userId });
                }
            });

            socket.on('stopTyping', ({ conversationId }: { conversationId: string }) => {
                if (conversationId) {
                    socket.to(`conv:${conversationId}`).emit('userStopTyping', { userId });
                }
            });

            socket.on('disconnect', () => {
                // Clean disconnect — rooms auto-leave on disconnect in Socket.IO
            });
        });

        res.socket.server.io = io;
    }

    res.end();
};

export default ioHandler;
