'use client';

import { useFilter } from './FilterProvider';
import { FilterType } from '@/lib/filterLogic';
import clsx from 'clsx';

interface FilterBarProps {
    counts: Partial<Record<FilterType, number>>;
}

const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'urgent', label: '🔥 Urgents' },
    { id: 'armees', label: 'Armées' },
    { id: 'interieur', label: 'Intérieur' },
    { id: 'dga', label: 'DGA' },
    { id: 'cyber', label: 'Cyber' },
    { id: 'naval', label: 'Naval' },
    { id: 'aerien', label: 'Aérien' },
];

export default function FilterBar({ counts }: FilterBarProps) {
    const { activeFilter, setActiveFilter } = useFilter();

    return (
        <div className="sticky top-[70px] z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-700 py-3 transition-all duration-300">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-2 min-w-max">
                    {FILTERS.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        const count = counts[filter.id];

                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-2",
                                    isActive
                                        ? "bg-gold-500 text-navy-900 border border-gold-500 shadow-[0_0_10px_rgba(241,196,15,0.3)]"
                                        : "bg-transparent text-gray-400 border border-navy-600 hover:bg-[#1a1a24] hover:border-gray-500 hover:text-white"
                                )}
                            >
                                {filter.label}
                                {filter.id === 'urgent' && (
                                    <span className={clsx(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                        isActive ? "bg-amber-500 text-white" : "bg-amber-900/50 text-amber-200"
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
