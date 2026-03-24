import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout userRole="FREELANCER">
            {children}
        </DashboardLayout>
    );
}
