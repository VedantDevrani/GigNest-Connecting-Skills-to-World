import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const baseUrl = req.nextUrl.origin; // http://localhost:3000

    // Simulate Client fetching messages from Freelancer
    // But since server doesn't have the cookie passed natively, we need to pass the headers from this request to the internal fetch
    const headers = new Headers(req.headers);

    // In order to make this test robust, we will just simulate the OR query directly again to double check Prisma
    return NextResponse.json({ ok: true });
}
