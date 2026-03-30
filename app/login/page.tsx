'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            // In a real app, you might want to store token in httpOnly cookie or context 
            // We rely on route middleware for protection but will save token locally for API calls
            document.cookie = `token=${data.token}; path=/; max-age=604800`;

            if (data.user.role === 'CLIENT') {
                router.push('/client/dashboard');
            } else {
                router.push('/freelancer/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 fade-in bg-gray-50 dark:bg-[#0a0a0a]">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold font-poppins text-foreground">
                        Welcome Back to Gig<span className="text-primary">Nest</span>
                    </CardTitle>
                    <p className="text-muted text-sm mt-2">Log in to your account to continue</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" fullWidth disabled={loading} className="mt-2">
                            {loading ? 'Logging in...' : 'Log In'}
                        </Button>

                        <p className="text-center text-sm text-muted mt-4">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
