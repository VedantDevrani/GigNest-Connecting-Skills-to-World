import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ClientProfileForm } from './ClientProfileForm';

export default async function ClientProfilePage() {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, name: true, email: true, bio: true, avatarUrl: true, createdAt: true },
    });

    if (!user) redirect('/login');

    return (
        <ClientProfileForm
            initialProfile={{
                ...user,
                createdAt: user.createdAt.toISOString(),
            }}
        />
    );
}
