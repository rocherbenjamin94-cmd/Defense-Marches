'use client';

import { Clock, Building2, ArrowRight } from 'lucide-react';
import { Tender } from '@/lib/types';
import Badge from './Badge';
import clsx from 'clsx';
import { useModal } from './ModalProvider';

interface CompactTenderCardProps {
    tender: Tender;
    className?: string;
}

export default function CompactTenderCard({ tender, className }: CompactTenderCardProps) {
    const { openModal } = useModal();

    const handleClick = () => {
        openModal(tender);
    };

    const isPrioritaire = tender.urgencyLevel === 'critical' || tender.urgencyLevel === 'urgent';
    const daysLeft = Math.ceil((new Date(tender.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Format date: "J-5" or "Today"
    const timeLabel = daysLeft > 0 ? `J-${daysLeft}` : 'Aujourd\'hui';

    // Format amount: "1.5M€"
    const amountLabel = tender.estimatedAmount
        ? `${(tender.estimatedAmount / 1000000).toFixed(1)}M€`
        : null;

    return (
        <div
            onClick={handleClick}
            className={clsx(
                "group relative flex-shrink-0 w-[220px] h-[160px] bg-navy-800 rounded-lg border border-navy-700 hover:border-gold-500/50 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer",
                className
            )}>
            {/* Header: Badges */}
            <div className="px-3 py-2 flex justify-between items-start">
                <div className="flex gap-1">
                    <Badge variant={isPrioritaire ? 'destructive' : 'secondary'} className="!text-[10px] !px-1.5 !py-0">
                        {timeLabel}
                    </Badge>
                    {amountLabel && (
                        <Badge variant="outline" className="!text-[10px] !px-1.5 !py-0 border-navy-600 text-gray-400">
                            {amountLabel}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-3 flex-1 flex flex-col min-h-0">
                <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-3 mb-auto group-hover:text-gold-500 transition-colors">
                    {tender.title}
                </h3>
            </div>

            {/* Footer: Buyer & CTA */}
            <div className="px-3 py-2 bg-navy-900/30 border-t border-navy-700/50 flex items-center justify-between mt-auto">
                <div className="flex items-center text-gray-500 text-[10px] truncate max-w-[70%]">
                    <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{tender.buyer.name}</span>
                </div>
                <div className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="h-3 w-3" />
                </div>
            </div>
        </div>
    );
}
