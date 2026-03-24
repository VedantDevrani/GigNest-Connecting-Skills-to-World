'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'FREELANCER',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to register');
            }

            document.cookie = `token=${data.token}; path=/; max-age=604800`;

            if (data.user.role === 'CLIENT') {
                router.push('/client/dashboard');
            } else {
                router.push('/freelancer/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 fade-in bg-gray-50 dark:bg-[#0a0a0a]">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-accent">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold font-poppins text-foreground">
                        Create an Account
                    </CardTitle>
                    <p className="text-muted text-sm mt-2">Join GigNest as a Freelancer or Client</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'FREELANCER' })}
                                className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${formData.role === 'FREELANCER'
                                        ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent'
                                        : 'border-gray-200 dark:border-gray-800 text-muted hover:border-accent/30'
                                    }`}
                            >
                                I'm a Freelancer
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                                className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${formData.role === 'CLIENT'
                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                                        : 'border-gray-200 dark:border-gray-800 text-muted hover:border-primary/30'
                                    }`}
                            >
                                I'm a Client
                            </button>
                        </div>

                        <Input
                            label="Full Name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Button type="submit" fullWidth disabled={loading} className="mt-2" variant={formData.role === 'CLIENT' ? 'primary' : 'secondary'}>
                            {loading ? 'Opening account...' : 'Sign Up'}
                        </Button>

                        <p className="text-center text-sm text-muted mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Log in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
