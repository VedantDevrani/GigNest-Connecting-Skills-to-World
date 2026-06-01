'use client';

import React from 'react';
import { Loader } from './Loader';

interface PageLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function PageLoader({ text = 'Loading...', fullScreen = false }: PageLoaderProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center'
    : 'w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <Loader size="lg" variant="spinner" />
        {text && (
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-poppins">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
