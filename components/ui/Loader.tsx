'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
      {/* Outer spinning ring */}
      <motion.span
        className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {/* Inner spinning ring (opposite direction) */}
      <motion.span
        className="absolute inset-[15%] border-2 border-transparent border-b-primary/50 border-l-primary/50 rounded-full"
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {/* Center dot pulsing */}
      <motion.span
        className="absolute inset-[40%] bg-primary rounded-full"
        animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
