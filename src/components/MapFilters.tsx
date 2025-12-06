'use client';

import { Shield, AlertCircle, Building2, Eye, Lock } from 'lucide-react';
import clsx from 'clsx';

interface MapFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export default function MapFilters({ activeFilter, onFilterChange }: MapFiltersProps) {
    const filters = [
        { id: 'all', label: 'Tous', icon: null, iconColor: 'text-slate-400' },
        { id: 'armees', label: 'Armées', icon: Shield, iconColor: 'text-blue-400' },
        { id: 'interieur', label: 'Intérieur', icon: Shield, iconColor: 'text-red-400' },
        { id: 'renseignement', label: 'Renseignement', icon: Eye, iconColor: 'text-yellow-400' },
        { id: 'etablissements', label: 'Établissements', icon: Building2, iconColor: 'text-green-400' },
        { id: 'urgents', label: 'Urgents', icon: AlertCircle, iconColor: 'text-orange-400' },
    ];

    return (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-3">
                {filters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;

                    return (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                isActive
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-[#14181F] border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-white hover:bg-[#1A1E26]"
                            )}
                        >
                            {Icon && <Icon className={clsx("h-4 w-4", isActive ? "text-white" : filter.iconColor)} />}
                            {filter.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
