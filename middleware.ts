import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];

    const isClientRoute = request.nextUrl.pathname.startsWith('/client');
    const isFreelancerRoute = request.nextUrl.pathname.startsWith('/freelancer');

    // Protect client and freelancer dashboard directories
    if (isClientRoute || isFreelancerRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const decoded = await verifyToken(token);

        if (!decoded) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Role-based authorization
        if (isClientRoute && decoded.role !== 'CLIENT') {
            return NextResponse.redirect(new URL('/freelancer/dashboard', request.url));
        }

        if (isFreelancerRoute && decoded.role !== 'FREELANCER') {
            return NextResponse.redirect(new URL('/client/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/client/:path*', '/freelancer/:path*'],
};
