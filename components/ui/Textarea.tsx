import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-medium text-foreground font-inter">
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
            flex w-full rounded-xl border bg-white dark:bg-[#111827] px-3 py-2 text-sm shadow-sm transition-colors font-inter
            placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 
            disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]
            ${error
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : 'border-gray-200 dark:border-gray-800 focus-visible:border-primary focus-visible:ring-primary'
                        }
            ${className}
          `}
                    {...props}
                />
                {(error || helperText) && (
                    <p className={`text-xs ${error ? 'text-red-500' : 'text-muted'}`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
