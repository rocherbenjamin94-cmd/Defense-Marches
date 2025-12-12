'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Building2, ChevronRight, FileText, Clock, Loader2, Shield, ShieldCheck } from 'lucide-react';

interface Acheteur {
    id: string;
    code: string;
    nom: string;
    tutelle: string;
    marchesActifs: number;
    marchesUrgents: number;
}

interface Stats {
    totalAcheteurs: number;
    acheteursAvecMarches: number;
    totalMarchesActifs: number;
    marchesUrgents: number;
}

type Ministere = 'defense' | 'interieur';

export default function AcheteursPage() {
    const [ministere, setMinistere] = useState<Ministere>('defense');
    const [acheteurs, setAcheteurs] = useState<Acheteur[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [tutelles, setTutelles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutelle, setSelectedTutelle] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset tutelle when changing ministère
    useEffect(() => {
        setSelectedTutelle('all');
    }, [ministere]);

    // Fetch acheteurs
    useEffect(() => {
        const params = new URLSearchParams();
        params.set('ministere', ministere);
        if (selectedTutelle !== 'all') params.set('tutelle', selectedTutelle);
        if (debouncedSearch) params.set('search', debouncedSearch);

        setLoading(true);
        fetch(`/api/acheteurs?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setAcheteurs(data.acheteurs || []);
                setStats(data.stats || null);
                setTutelles(data.tutelles || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [ministere, selectedTutelle, debouncedSearch]);

    const ministereLabel = ministere === 'defense' ? 'Défense' : 'Intérieur';
    const accentColor = ministere === 'defense' ? 'blue' : 'blue';

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Annuaire des Acheteurs</h1>
                    <p className="text-gray-400 mb-4">
                        Entités acheteuses des ministères régaliens
                    </p>
                </div>

                {/* Tabs Ministère */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setMinistere('defense')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${ministere === 'defense'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        Défense
                    </button>
                    <button
                        onClick={() => setMinistere('interieur')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${ministere === 'interieur'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <ShieldCheck className="w-5 h-5" />
                        Intérieur
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="flex flex-wrap gap-4 text-sm mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <span className="text-gray-400">
                            <span className="text-white font-bold">{stats.totalAcheteurs}</span> entités {ministereLabel}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">
                            <span className={`font-bold ${ministere === 'defense' ? 'text-blue-400' : 'text-blue-400'}`}>
                                {stats.acheteursAvecMarches}
                            </span> avec marchés actifs
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">
                            <span className="text-green-400 font-bold">{stats.totalMarchesActifs}</span> marchés en cours
                        </span>
                        {stats.marchesUrgents > 0 && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-amber-400">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    <span className="font-bold">{stats.marchesUrgents}</span> clôturent sous 7j
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* Barre de recherche */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Filtres par tutelle */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedTutelle('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTutelle === 'all'
                            ? (ministere === 'defense' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white')
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        Tous
                    </button>
                    {tutelles.map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedTutelle(t)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTutelle === t
                                ? (ministere === 'defense' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white')
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className={`w-8 h-8 animate-spin ${ministere === 'defense' ? 'text-blue-500' : 'text-blue-500'}`} />
                        <span className="ml-3 text-gray-400">Chargement des acheteurs et marchés {ministereLabel}...</span>
                    </div>
                ) : (
                    <>
                        {/* Grille des acheteurs */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {acheteurs.map((acheteur) => (
                                <Link
                                    key={acheteur.id}
                                    href={`/acheteurs/${acheteur.id}`}
                                    className={`bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-${accentColor}-500/30 hover:bg-slate-800 transition-all group`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ministere === 'defense' ? 'bg-blue-500/10' : 'bg-blue-500/10'
                                            }`}>
                                            <Building2 className={`w-5 h-5 ${ministere === 'defense' ? 'text-blue-400' : 'text-blue-400'
                                                }`} />
                                        </div>
                                        <span className="text-xs bg-slate-700 text-gray-400 px-2 py-1 rounded-full">
                                            {acheteur.tutelle}
                                        </span>
                                    </div>

                                    <p className={`text-xs font-mono mb-1 ${ministere === 'defense' ? 'text-blue-400' : 'text-blue-400'
                                        }`}>{acheteur.code}</p>
                                    <h3 className="text-white font-medium mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                        {acheteur.nom}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                <span className={`text-sm font-bold ${acheteur.marchesActifs > 0 ? 'text-green-400' : 'text-gray-600'
                                                    }`}>
                                                    {acheteur.marchesActifs}
                                                </span>
                                            </div>
                                            {acheteur.marchesUrgents > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                    <span className="text-sm font-bold text-amber-400">
                                                        {acheteur.marchesUrgents}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Empty state */}
                        {acheteurs.length === 0 && (
                            <div className="text-center py-20">
                                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">Aucun acheteur trouvé pour cette recherche.</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}
