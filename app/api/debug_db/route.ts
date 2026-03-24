import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const messages = await prisma.message.findMany();
    const users = await prisma.user.findMany();
    return NextResponse.json({ messages, users });
}
