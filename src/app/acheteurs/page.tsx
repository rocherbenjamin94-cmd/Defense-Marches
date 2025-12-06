'use client';

import { useState } from 'react';
import BuyerCard from '@/components/BuyerCard';
import { BUYERS_LOCATIONS } from '@/lib/buyers';
import { Search, Filter } from 'lucide-react';
import clsx from 'clsx';

export default function BuyersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Tous', count: BUYERS_LOCATIONS.length },
        { id: 'armees', label: 'Armées', count: BUYERS_LOCATIONS.filter(b => b.famille === 'armees').length, color: 'text-blue-400' },
        { id: 'interieur', label: 'Intérieur', count: BUYERS_LOCATIONS.filter(b => b.famille === 'interieur').length, color: 'text-red-400' },
        { id: 'renseignement', label: 'Renseignement', count: BUYERS_LOCATIONS.filter(b => b.famille === 'renseignement').length, color: 'text-yellow-400' },
        { id: 'etablissements', label: 'Établissements', count: BUYERS_LOCATIONS.filter(b => b.famille === 'etablissements').length, color: 'text-green-400' },
    ];

    const filteredBuyers = BUYERS_LOCATIONS.filter(buyer => {
        const matchesSearch = buyer.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            buyer.adresse.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || buyer.famille === activeFilter;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => b.activeTenders - a.activeTenders); // Default sort by active tenders

    return (
        <div className="min-h-screen bg-[#0B0D11] text-gray-100 font-sans selection:bg-blue-500/30">
            {/* Navbar handled by layout */}

            <main className="pt-[70px] pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Search */}
                <div className="py-8 space-y-6">
                    <h1 className="text-3xl font-bold text-white">Annuaire des Acheteurs</h1>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 bg-[#14181F] border border-white/10 rounded-xl leading-5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="Rechercher un acheteur par nom, ville..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-4 py-3 bg-[#14181F] border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <span className="hidden sm:inline">Filtres</span>
                        </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                    activeFilter === filter.id
                                        ? "bg-blue-600 text-white border-blue-500"
                                        : "bg-[#14181F] text-slate-400 border-white/5 hover:bg-white/5"
                                )}
                            >
                                <span className={filter.color}>{filter.id !== 'all' ? '● ' : ''}</span>
                                {filter.label}
                                <span className="ml-2 text-xs opacity-60">({filter.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Buyers List */}
                <div className="space-y-4">
                    {filteredBuyers.map((buyer) => (
                        <BuyerCard key={buyer.id} buyer={buyer} />
                    ))}

                    {filteredBuyers.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            Aucun acheteur trouvé pour cette recherche.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
