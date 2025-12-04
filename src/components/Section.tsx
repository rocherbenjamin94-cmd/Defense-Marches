import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface SectionProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
    scrollable?: boolean;
}

export default function Section({
    title,
    subtitle,
    icon,
    children,
    actionLabel,
    actionHref,
    className = "",
    scrollable = false
}: SectionProps) {
    return (
        <section className={`py-8 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {icon && <span className="text-gold-500">{icon}</span>}
                        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                    </div>
                    {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
                </div>

                {actionLabel && actionHref && (
                    <Link
                        href={actionHref}
                        className="hidden sm:flex items-center text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors"
                    >
                        {actionLabel} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                )}
            </div>

            <div className={scrollable ? "overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory overflow-y-visible" : ""}>
                <div className={scrollable ? "flex gap-4 px-4 sm:px-6 lg:px-8 min-w-max h-full items-stretch" : "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8"}>
                    {scrollable ? (
                        React.Children.map(children, child => (
                            <div className="snap-start">
                                {child}
                            </div>
                        ))
                    ) : (
                        children
                    )}
                </div>
            </div>
        </section>
    );
}
