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

                (socket as any).userId = payload.id;
                next();
            } catch (e) {
                next(new Error('Authentication error'));
            }
        });

        io.on('connection', (socket) => {
            const userId = (socket as any).userId;
            console.log("Socket connected:", socket.id);
            
            socket.join(userId);
            console.log("User joined room:", userId);

            socket.on('sendMessage', async ({ receiverId, content }) => {
                const senderId = (socket as any).userId;
                if (!receiverId || !content) return;

                try {
                    const message = await prisma.message.create({
                        data: {
                            senderId,
                            receiverId,
                            content
                        }
                    });

                    // Emit to receiver instantly
                    io.to(receiverId).emit("receiveMessage", message);

                    // Emit back to sender
                    socket.emit("receiveMessage", message);
                } catch (error) {
                    console.error('Send message error:', error);
                }
            });

            socket.on('markAsRead', async ({ senderId }) => {
                if (!senderId) return;

                try {
                    await prisma.message.updateMany({
                        where: { senderId, receiverId: userId, isRead: false },
                        data: { isRead: true }
                    });

                    // Notify sender
                    io.to(senderId).emit('messageRead');
                } catch (error) {
                    console.error('Mark as read error:', error);
                }
            });

            socket.on('typing', (receiverId) => {
                if (receiverId) {
                    socket.to(receiverId).emit('userTyping');
                }
            });

            socket.on('stopTyping', (receiverId) => {
                if (receiverId) {
                    socket.to(receiverId).emit('userStopTyping');
                }
            });

            socket.on('disconnect', () => {
                console.log("Socket disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;
