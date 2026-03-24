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

export async function GET(req: NextRequest) {
    try {
        const userToken = await getUser();
        if (!userToken || userToken.role !== 'FREELANCER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const q = url.searchParams.get('q') || '';
        const minBudget = parseFloat(url.searchParams.get('minBudget') || '0');
        const maxBudget = parseFloat(url.searchParams.get('maxBudget') || '0');
        const reqSkills = url.searchParams.get('skills')?.toLowerCase().split(',').filter(s => s.trim() !== '') || [];
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');

        // Fetch user completely to get their own skills
        const freelancer = await prisma.user.findUnique({
            where: { id: userToken.id },
            select: { skills: true }
        });
        const freelancerSkills = freelancer?.skills?.map(s => s.toLowerCase()) || [];

        // Base where clause
        let whereClause: any = {
            status: 'OPEN'
        };

        if (q) {
            whereClause.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
            ];
        }

        if (minBudget > 0 || maxBudget > 0) {
            whereClause.budget = {};
            if (minBudget > 0) whereClause.budget.gte = minBudget;
            if (maxBudget > 0) whereClause.budget.lte = maxBudget;
        }

        let jobs = await prisma.job.findMany({
            where: whereClause,
            include: {
                client: { select: { id: true, name: true, createdAt: true } },
                _count: { select: { proposals: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter by required skills in JS due to array overlap limitations in some prisma adapters
        if (reqSkills.length > 0) {
            jobs = jobs.filter(job => {
                const jobSkills = job.skills.map(s => s.toLowerCase());
                return reqSkills.some(rs => jobSkills.includes(rs));
            });
        }

        // Calculate Match Percentage and attach it
        let fullyProcessedJobs = jobs.map(job => {
            const jobSkills = job.skills.map(s => s.toLowerCase());
            let matchPercentage = 100;

            if (jobSkills.length > 0) {
                const overlap = jobSkills.filter(s => freelancerSkills.includes(s)).length;
                matchPercentage = Math.round((overlap / jobSkills.length) * 100);
            }

            return {
                ...job,
                matchPercentage
            };
        });

        // Sort by match percentage (descending) then by date
        fullyProcessedJobs.sort((a, b) => {
            if (b.matchPercentage !== a.matchPercentage) {
                return b.matchPercentage - a.matchPercentage;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const total = fullyProcessedJobs.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedJobs = fullyProcessedJobs.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            jobs: paginatedJobs,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error('Fetch Jobs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
