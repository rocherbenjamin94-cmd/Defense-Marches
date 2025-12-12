'use client';

import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface DocumentTypeCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    status: 'available' | 'coming-soon' | 'premium' | 'future';
    onClick?: () => void;
    disabled?: boolean;
}

export default function DocumentTypeCard({
    title,
    description,
    icon: Icon,
    status,
    onClick,
    disabled = false
}: DocumentTypeCardProps) {
    const isClickable = status === 'available' && !disabled;

    const statusBadge = {
        'available': null,
        'coming-soon': <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full">Bientôt</span>,
        'premium': <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-full">Premium</span>,
        'future': <span className="px-2 py-0.5 text-xs font-medium bg-slate-500/10 text-slate-400 rounded-full">Prochainement</span>,
    };

    return (
        <div
            onClick={isClickable ? onClick : undefined}
            className={clsx(
                "relative p-6 rounded-xl border transition-all duration-200",
                isClickable
                    ? "bg-slate-800/50 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 cursor-pointer group"
                    : "bg-slate-900/30 border-slate-800 cursor-not-allowed opacity-60"
            )}
        >
            {/* Status badge */}
            {statusBadge[status] && (
                <div className="absolute top-3 right-3">
                    {statusBadge[status]}
                </div>
            )}

            {/* Icon */}
            <div className={clsx(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                isClickable
                    ? "bg-blue-500/10 group-hover:bg-blue-500/20"
                    : "bg-slate-700/30"
            )}>
                <Icon className={clsx(
                    "w-6 h-6",
                    isClickable ? "text-blue-400" : "text-slate-500"
                )} />
            </div>

            {/* Title */}
            <h3 className={clsx(
                "text-lg font-semibold mb-1",
                isClickable ? "text-white" : "text-slate-500"
            )}>
                {title}
            </h3>

            {/* Description */}
            <p className={clsx(
                "text-sm",
                isClickable ? "text-slate-400" : "text-slate-600"
            )}>
                {description}
            </p>

            {/* Arrow indicator for clickable cards */}
            {isClickable && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </div>
    );
}
