'use client';

import React from 'react';
import { Loader } from './Loader';
import { motion } from 'framer-motion';

interface PageLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function PageLoader({ text = 'Loading...', fullScreen = false }: PageLoaderProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
    : "w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader size="lg" />
        {text && (
          <motion.p 
            className="text-sm font-medium text-gray-500 dark:text-gray-400 font-poppins"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
