'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function SeedButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            await fetch('/api/jobs/seed', { method: 'POST' });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button onClick={handleSeed} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Generating Dummy Data...' : 'Seed 4 Dummy Jobs to Test'}
        </Button>
    )
}
