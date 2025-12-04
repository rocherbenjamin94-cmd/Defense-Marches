'use client';

import { Shield, AlertCircle, Building2, Eye, Lock } from 'lucide-react';
import clsx from 'clsx';

interface MapFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export default function MapFilters({ activeFilter, onFilterChange }: MapFiltersProps) {
    const filters = [
        { id: 'all', label: 'Tous', icon: null, color: 'bg-navy-700 text-white' },
        { id: 'armees', label: 'Armées', icon: Shield, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
        { id: 'interieur', label: 'Intérieur', icon: Shield, color: 'bg-red-500/20 text-red-400 border-red-500/50' },
        { id: 'renseignement', label: 'Renseignement', icon: Eye, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        { id: 'etablissements', label: 'Établissements', icon: Building2, color: 'bg-green-500/20 text-green-400 border-green-500/50' },
        { id: 'urgents', label: 'Urgents', icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
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
                                    ? clsx(filter.color, "border-opacity-100 bg-opacity-30")
                                    : "bg-navy-800 border-navy-700 text-gray-400 hover:bg-navy-700 hover:text-gray-200"
                            )}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {filter.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
