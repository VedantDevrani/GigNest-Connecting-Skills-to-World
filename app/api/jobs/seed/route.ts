import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // We need a dummy client to assign the jobs to.
        let client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });

        if (!client) {
            // Create an anonymous client if none exists
            client = await prisma.user.create({
                data: {
                    name: 'ACME Corp',
                    email: 'hello@acme.test',
                    password: 'hashed-password-stub', // Never actually used to log in
                    role: 'CLIENT',
                    bio: 'A large tech company building innovative products.'
                }
            });
        }

        const dummyJobs = [
            {
                title: 'Full Stack Next.js Developer Needed for SaaS V2',
                description: 'We are looking for an expert Next.js developer to help us rebuild our dashboard. Must have experience with Tailwind CSS, Prisma, and PostgreSQL. Expected to work closely with our design team to implement pixel-perfect UIs.',
                budget: 4500,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
                clientId: client.id,
                status: 'OPEN' as any
            },
            {
                title: 'Senior UX/UI Designer for Mobile App',
                description: 'Need a talented designer to create wireframes and high-fidelity prototypes for a new fintech mobile app. We prefer Figma. Please include a link to your Dribbble or Behance portfolio.',
                budget: 3200,
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
                clientId: client.id,
                status: 'OPEN' as any
            },
            {
                title: 'Smart Contract Auditor / Solidity Expert',
                description: 'Looking for a blockchain professional to review and audit our new token staking smart contracts before mainnet deployment. Security is our absolute highest priority.',
                budget: 6500,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                skills: ['Solidity', 'Blockchain Security', 'Smart Contracts', 'Web3'],
                clientId: client.id,
                status: 'OPEN' as any
            },
            {
                title: 'SEO Content Writer for Tech Blog',
                description: 'We need 5 high-quality, 1500-word articles related to artificial intelligence, machine learning, and automation. Articles must be SEO optimized and pass plagiarism checks.',
                budget: 800,
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                skills: ['Copywriting', 'SEO', 'Technical Writing'],
                clientId: client.id,
                status: 'OPEN' as any
            }
        ];

        await prisma.job.createMany({
            data: dummyJobs
        });

        return NextResponse.json({ success: true, message: 'Dummy jobs added successfully!' });
    } catch (error: any) {
        console.error('Error seeding jobs:', error);
        return NextResponse.json({ error: error.message || 'Failed to seed jobs' }, { status: 500 });
    }
}
