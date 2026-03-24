'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    toast: (options: { type: ToastType; message: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback(({ type, message, duration = 3000 }: { type: ToastType; message: string; duration?: number }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 min-w-[300px] max-w-sm
              ${t.type === 'success' ? 'bg-white dark:bg-gray-900 border-green-100 dark:border-green-900 shadow-green-500/10' : ''}
              ${t.type === 'error' ? 'bg-white dark:bg-gray-900 border-red-100 dark:border-red-900 shadow-red-500/10' : ''}
              ${t.type === 'info' ? 'bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900 shadow-blue-500/10' : ''}
            `}
                        style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
                    >
                        {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                        {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                        {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />}

                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{t.message}</p>

                        <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
        </ToastContext.Provider>
    );
}
