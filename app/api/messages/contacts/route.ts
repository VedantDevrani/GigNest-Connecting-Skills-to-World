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
    const userToken = await getUser();
    if (!userToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const sentMessages = await prisma.message.findMany({
            where: { senderId: userToken.id },
            select: { receiver: { select: { id: true, name: true, role: true } }, createdAt: true, content: true }
        });

        const receivedMessages = await prisma.message.findMany({
            where: { receiverId: userToken.id },
            select: { sender: { select: { id: true, name: true, role: true } }, createdAt: true, content: true }
        });

        const validContactIds = new Set<string>();
        const contactsMap = new Map();

        const addContact = (user: any, msg: any = null) => {
            if (!user) return;
            // ONLY ALLOW CONTACTS WITH A VALID RELATION
            if (!validContactIds.has(user.id)) return;
            
            const existing = contactsMap.get(user.id);
            const msgDate = msg ? new Date(msg.createdAt) : new Date(0);
            if (!existing || existing.updatedAt < msgDate) {
                contactsMap.set(user.id, {
                    ...user,
                    lastMessage: msg ? msg.content : existing?.lastMessage || null,
                    updatedAt: msgDate > (existing?.updatedAt || new Date(0)) ? msgDate : existing?.updatedAt
                });
            }
        };

        // Determine valid relations from Contracts and Proposals
        if (userToken.role === 'CLIENT') {
            const contracts = await prisma.contract.findMany({
                where: { clientId: userToken.id },
                include: { freelancer: { select: { id: true, name: true, role: true } } }
            });
            contracts.forEach(c => validContactIds.add(c.freelancer.id));

            const proposals = await prisma.proposal.findMany({
                where: { job: { clientId: userToken.id } },
                include: { freelancer: { select: { id: true, name: true, role: true } } }
            });
            proposals.forEach(p => validContactIds.add(p.freelancer.id));

            // Initialize contacts
            contracts.forEach(c => addContact(c.freelancer, { createdAt: c.createdAt, content: 'Contract started' }));
            proposals.forEach(p => addContact(p.freelancer, { createdAt: p.createdAt, content: 'Proposal submitted' }));
            
        } else {
            const contracts = await prisma.contract.findMany({
                where: { freelancerId: userToken.id },
                include: { client: { select: { id: true, name: true, role: true } } }
            });
            contracts.forEach(c => validContactIds.add(c.client.id));

            const proposals = await prisma.proposal.findMany({
                where: { freelancerId: userToken.id },
                include: { job: { include: { client: { select: { id: true, name: true, role: true } } } } }
            });
            proposals.forEach(p => validContactIds.add(p.job.client.id));

            // Initialize contacts
            contracts.forEach(c => addContact(c.client, { createdAt: c.createdAt, content: 'Contract started' }));
            proposals.forEach(p => addContact(p.job.client, { createdAt: p.createdAt, content: 'Proposal submitted' }));
        }

        sentMessages.forEach(m => addContact(m.receiver, m));
        receivedMessages.forEach(m => addContact(m.sender, m));

        const contacts = Array.from(contactsMap.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        return NextResponse.json({ contacts, currentUserId: userToken.id });
    } catch (error) {
        console.error('Fetch Contacts Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
