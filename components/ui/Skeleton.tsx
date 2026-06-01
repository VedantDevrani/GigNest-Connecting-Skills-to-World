import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/50 ${className}`}
            aria-hidden="true"
        />
    );
}

interface ListPageSkeletonProps {
    title?: string;
    rows?: number;
}

export function ListPageSkeleton({ title, rows = 3 }: ListPageSkeletonProps) {
    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                {title ? (
                    <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">{title}</h1>
                ) : (
                    <Skeleton className="h-9 w-48" />
                )}
                <Skeleton className="h-4 w-72 mt-2" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4"
                    >
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-7 w-16 rounded-lg" />
                            <Skeleton className="h-7 w-16 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
