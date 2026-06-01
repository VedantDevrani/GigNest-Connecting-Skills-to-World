import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Basic in-memory rate limiting map
// Key: IP address, Value: { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60 * 1000; // per minute

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const limitRecord = rateLimitMap.get(ip);

        if (limitRecord) {
            if (now > limitRecord.resetTime) {
                // Window expired, reset
                rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
            } else if (limitRecord.count >= RATE_LIMIT) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    { status: 429 }
                );
            } else {
                limitRecord.count++;
            }
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        }

        // Periodic cleanup of rate limit map
        if (Math.random() < 0.1) {
            for (const [key, value] of rateLimitMap.entries()) {
                if (now > value.resetTime) {
                    rateLimitMap.delete(key);
                }
            }
        }

        const body = await req.json();
        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required (name, email, subject, message).' },
                { status: 400 }
            );
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address.' },
                { status: 400 }
            );
        }

        // Send Email using Resend
        const resend = new Resend(process.env.RESEND_API_KEY);
        const data = await resend.emails.send({
            from: 'Gignest Contact <onboarding@resend.dev>',
            to: ['vedantdevrani177@gmail.com'],
            replyTo: email,
            subject: `New Contact Form Submission - ${subject}`,
            text: `
Name: ${name}
Email: ${email}
Subject: ${subject}
Message:
${message}

Submission Time: ${new Date().toISOString()}
            `.trim(),
        });

        if (data.error) {
            return NextResponse.json(
                { error: 'Failed to send email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
