'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApplyButtonProps {
    jobId: string;
    isLoggedIn: boolean;
}

export function ApplyButton({ jobId, isLoggedIn }: ApplyButtonProps) {
    const router = useRouter();

    const handleApply = (e: React.MouseEvent) => {
        // Stop the click from bubbling up to the parent <Link> (job card)
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            // Redirect to login, then come back to this job after sign-in
            router.push(`/login?redirect=/jobs/${jobId}`);
        } else {
            router.push(`/jobs/${jobId}`);
        }
    };

    return (
        <Button
            className="w-full flex justify-between items-center"
            onClick={handleApply}
        >
            Apply <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
    );
}
