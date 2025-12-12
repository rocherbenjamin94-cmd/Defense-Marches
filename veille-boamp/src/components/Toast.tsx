'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <div
            className={clsx(
                "fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 bg-navy-800 border border-gold-500/50 rounded-lg shadow-lg transition-all duration-300 transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
            )}
        >
            <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <Check className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-white">{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
