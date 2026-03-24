import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import cookie from 'cookie';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        console.log(`[Socket.io] Starting Server on ${path}`);

        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.use(async (socket, next) => {
            try {
                const cookies = cookie.parse(socket.request.headers.cookie || '');
                const token = cookies.token;

                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const payload = await verifyToken(token);
                if (!payload || !payload.id) {
                    return next(new Error('Authentication error'));
                }

                socket.data.user = payload;
                next();
            } catch (e) {
                next(new Error('Authentication error'));
            }
        });

        io.on('connection', (socket) => {
            const user = socket.data.user;
            socket.join(user.id);

            socket.on('sendMessage', async (message) => {
                const { receiverId } = message;
                if (!receiverId) return;

                try {
                    // Because NextJS natively handles the Postgres insert via POST /api/messages, we purely use websockets for the live delivery ping
                    socket.to(receiverId).emit('message', message);
                    socket.emit('message', message);
                } catch (error) {
                    console.error('Send message error:', error);
                }
            });

            socket.on('markAsRead', async (data) => {
                const { messageId, senderId } = data;
                if (!messageId || !senderId) return;

                try {
                    // @ts-ignore
                    const message = await prisma.message.update({
                        where: { id: messageId },
                        data: { isRead: true }
                    });

                    // notify sender that it's read
                    socket.to(senderId).emit('messageRead', { messageId, receiverId: user.id });
                } catch (error) {
                    console.error('Mark as read error:', error);
                }
            });

            socket.on('typing', (data) => {
                const { receiverId } = data;
                if (receiverId) {
                    socket.to(receiverId).emit('typing', { senderId: user.id });
                }
            });

            socket.on('stopTyping', (data) => {
                const { receiverId } = data;
                if (receiverId) {
                    socket.to(receiverId).emit('stopTyping', { senderId: user.id });
                }
            });

            socket.on('disconnect', () => {
                // Future cleanup
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;
