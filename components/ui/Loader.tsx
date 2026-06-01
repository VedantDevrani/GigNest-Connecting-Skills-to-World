'use client';

import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  /** dots = compact pulse (best for buttons); spinner = radial (best for pages/sections); auto picks by size */
  variant?: 'dots' | 'spinner' | 'auto';
  className?: string;
}

function DotsLoader({ size, className }: { size: LoaderProps['size']; className: string }) {
  const sizeClass = size === 'sm' ? 'loader-dots--sm' : size === 'lg' ? 'loader-dots--lg' : '';

  return (
    <div className={`loader-dots ${sizeClass} ${className}`.trim()} role="status" aria-label="Loading">
      <div className="loader-dot" />
      <div className="loader-dot" />
      <div className="loader-dot" />
      <div className="loader-dot" />
    </div>
  );
}

function SpinnerLoader({ size, className }: { size: LoaderProps['size']; className: string }) {
  const sizeClass = size === 'sm' ? 'loader-spinner--sm' : size === 'lg' ? 'loader-spinner--lg' : '';

  return (
    <div className={`loader-spinner ${sizeClass} ${className}`.trim()} role="status" aria-label="Loading">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="loader-spinner-bar" />
      ))}
    </div>
  );
}

export function Loader({ size = 'md', variant = 'auto', className = '' }: LoaderProps) {
  const resolvedVariant = variant === 'auto' ? (size === 'sm' ? 'dots' : 'spinner') : variant;

  if (resolvedVariant === 'dots') {
    return <DotsLoader size={size} className={className} />;
  }

  return <SpinnerLoader size={size} className={className} />;
}
