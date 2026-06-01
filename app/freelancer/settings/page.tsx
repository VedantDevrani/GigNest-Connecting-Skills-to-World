import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { FreelancerSettingsForm } from './FreelancerSettingsForm';

export default async function FreelancerSettingsPage() {
    const session = await getSession();
    if (!session || session.role !== 'FREELANCER') redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, name: true, email: true, bio: true, hourlyRate: true, skills: true, avatarUrl: true, createdAt: true },
    });

    if (!user) redirect('/login');

    return (
        <FreelancerSettingsForm
            initialProfile={{
                ...user,
                createdAt: user.createdAt.toISOString(),
            }}
        />
    );
}
