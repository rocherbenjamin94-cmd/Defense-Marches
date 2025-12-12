'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import useSWR from 'swr';
import TenderDetailModal from './TenderDetailModal';

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());
import { Search, Sparkles, ChevronRight, X, Check, Clock, Star, Database, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

import { Tender } from "@/lib/types";
import {
    filterTendersCombined,
    FilterState,
    EntityFilter,
    NatureFilter,
    SourceFilter,
    AmountFilter,
    getMarketNatureLabel
} from "@/lib/filterLogic";
import { Package as PackageIcon, Briefcase, HardHat } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

// Types de tri
type SortOption = 'pertinence' | 'date_pub' | 'date_limit' | 'buyer';
const SORT_LABELS: Record<SortOption, string> = {
    pertinence: 'Pertinence',
    date_pub: 'Plus récents',
    date_limit: 'Deadline proche',
    buyer: 'Acheteur A-Z'
};

// Helper for relative time (J-X)
const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const d = new Date(deadline);
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};


// Loading fallback pour Suspense
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
    );
}

// Main wrapper avec Suspense
export default function TenderSpotterHome() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <TenderSpotterContent />
        </Suspense>
    );
}

function TenderSpotterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const { isSignedIn } = useAuth();
    const { toggleFavorite, isFavorite, favorites } = useFavorites();

    // SWR pour les marchés avec cache client de 5 minutes (BOAMP + PLACE combinés)
    const { data: tendersData, isLoading: loading } = useSWR(
        '/api/tenders/all',
        fetcher,
        {
            dedupingInterval: 5 * 60 * 1000, // 5 minutes - ne refetch pas si déjà dans le cache
            revalidateOnFocus: false, // Ne pas refetch quand l'utilisateur revient sur l'onglet
        }
    );
    const tenders: Tender[] = tendersData?.tenders || [];
    const sources = tendersData?.sources || { boamp: 0, place: 0, total: 0 };

    // Initialiser depuis URL
    const getInitialFilters = useCallback((): FilterState => ({
        entity: (searchParams.get('entity') as EntityFilter) || 'all',
        amount: (searchParams.get('amount') as AmountFilter) || 'all',
        nature: (searchParams.get('nature') as NatureFilter) || 'all',
        source: (searchParams.get('source') as SourceFilter) || 'all'
    }), [searchParams]);

    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [activeStatFilter, setActiveStatFilter] = useState<'all' | 'open' | 'today' | 'closing'>('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [visibleCount, setVisibleCount] = useState(18); // Nombre de marchés affichés
    const [timeFilter, setTimeFilter] = useState<'today' | 'urgent' | null>(
        searchParams.get('time') === 'today' ? 'today' :
        searchParams.get('time') === 'urgent' ? 'urgent' : null
    );
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'pertinence');

    // Nouveaux filtres combinés
    const [filters, setFilters] = useState<FilterState>(getInitialFilters);

    // Sync URL quand les filtres changent
    const updateURL = useCallback((newFilters: FilterState, newSearch: string, newSort: SortOption, newTimeFilter: 'today' | 'urgent' | null) => {
        const params = new URLSearchParams();

        if (newSearch) params.set('q', newSearch);
        if (newFilters.entity !== 'all') params.set('entity', newFilters.entity);
        if (newFilters.nature !== 'all') params.set('nature', newFilters.nature);
        if (newFilters.source !== 'all') params.set('source', newFilters.source);
        if (newSort !== 'pertinence') params.set('sort', newSort);
        if (newTimeFilter) params.set('time', newTimeFilter);

        const queryString = params.toString();
        const newURL = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(newURL, { scroll: false });
    }, [pathname, router]);

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        updateURL(newFilters, debouncedSearch, sortBy, timeFilter);
    };

    // Sync URL quand le tri change
    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        updateURL(filters, debouncedSearch, newSort, timeFilter);
    };

    // Sync URL quand le filtre temporel change
    const handleTimeFilterChange = (newTimeFilter: 'today' | 'urgent' | null) => {
        setTimeFilter(newTimeFilter);
        updateURL(filters, debouncedSearch, sortBy, newTimeFilter);
    };

    // Debounce search + sync URL
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            updateURL(filters, searchQuery, sortBy, timeFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    // Types for analyzed markets
    interface AnalysedMarche {
        marcheId: string;
        titre: string;
        acheteur: string;
        scoreCompatibilite: number;
        difficulte: 'facile' | 'moyen' | 'difficile';
        dateLimite: string;
        analysedAt: string;
    }

    const [analysedMarches, setAnalysedMarches] = useState<AnalysedMarche[]>([]);

    // Charger les marchés analysés par l'IA (cache séparé)
    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        fetch(`${apiUrl}/api/analyse/cache/analysed`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setAnalysedMarches(data))
            .catch(() => setAnalysedMarches([]));
    }, []);

    // Derived State
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        return {
            recentCount: tenders.length,
            todayCount: tenders.filter(t => t.publicationDate && t.publicationDate.startsWith(todayStr)).length,
            closingCount: tenders.filter(t => {
                if (!t.deadlineDate) return false;
                const d = new Date(t.deadlineDate);
                return d >= now && d <= nextWeek;
            }).length,
        };
    }, [tenders]);

    const filteredTenders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        // Appliquer les filtres combinés
        let res = filterTendersCombined(tenders, filters);

        // Apply stat filter
        if (activeStatFilter === 'open') {
            // Marchés récents : triés par date de publication décroissante
            res = res.sort((a, b) => {
                const pubA = new Date(a.publicationDate).getTime();
                const pubB = new Date(b.publicationDate).getTime();
                return pubB - pubA;
            });
        } else if (activeStatFilter === 'today') {
            res = res.filter(t => t.publicationDate && t.publicationDate.startsWith(todayStr));
        } else if (activeStatFilter === 'closing') {
            res = res.filter(t => {
                if (!t.deadlineDate) return false;
                const d = new Date(t.deadlineDate);
                return d >= now && d <= nextWeek;
            });
        }

        // Recherche textuelle (debounced)
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            res = res.filter(t =>
                (t.title?.toLowerCase().includes(q) || false) ||
                (t.buyer?.name.toLowerCase().includes(q) || false) ||
                (t.description?.toLowerCase().includes(q) || false)
            );
        }

        // Filtre favoris
        if (showFavoritesOnly) {
            res = res.filter(t => isFavorite(t.id));
        }

        // Filtre temporel : Publié ce jour
        if (timeFilter === 'today') {
            res = res.filter(t => t.publicationDate && t.publicationDate.startsWith(todayStr));
        }

        // Filtre temporel : Clôture < 7 jours
        if (timeFilter === 'urgent') {
            res = res.filter(t => {
                const days = getDaysRemaining(t.deadlineDate);
                return days !== null && days >= 0 && days <= 7;
            });
        }

        // Tri personnalisé ou par pertinence
        const isDefenseBuyer = (buyerName: string): number => {
            const name = buyerName.toLowerCase();
            if (name.includes('armée de terre') || name.includes('armée de l\'air') ||
                name.includes('marine nationale') || name.includes('ministère des armées') ||
                name.includes('minarm') || name.includes('esid')) {
                return 1;
            }
            if (name.includes('direction générale de l\'armement') || name.includes('dga')) {
                return 2;
            }
            if (name.includes('gendarmerie') || name.includes('police nationale') ||
                name.includes('ministère de l\'intérieur') || name.includes('préfecture') ||
                name.includes('sgami') || name.includes('dggn')) {
                return 3;
            }
            return 4;
        };

        res = [...res].sort((a, b) => {
            switch (sortBy) {
                case 'date_pub':
                    return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
                case 'date_limit':
                    return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
                case 'buyer':
                    return (a.buyer?.name || '').localeCompare(b.buyer?.name || '');
                case 'pertinence':
                default:
                    // Tri par pertinence : acheteurs défense en premier, puis par date
                    const priorityA = isDefenseBuyer(a.buyer?.name || '');
                    const priorityB = isDefenseBuyer(b.buyer?.name || '');
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }
                    return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
            }
        });

        return res;
    }, [tenders, filters, debouncedSearch, activeStatFilter, showFavoritesOnly, isFavorite, timeFilter, sortBy]);

    return (
        <div className="min-h-screen bg-[var(--bg-body)] text-slate-600 dark:text-[#94A3B8] font-sans selection:bg-blue-500/20 selection:text-blue-600 dark:selection:bg-blue-900/50 dark:selection:text-blue-200">

            {/* Background Ambience */}
            <div className="fixed inset-0 grid-pattern pointer-events-none z-0 opacity-50 dark:opacity-100"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-500/5 dark:bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

            {/* Main Content */}
            <main className="pt-24 pb-20 relative min-h-screen z-10">
                {/* Centered Header */}
                <section className="py-12 text-center">
                    <div className="max-w-4xl mx-auto px-6">

                        {/* Titre + Tagline */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">TENDERSPOTTER</span>
                        </h1>
                        <p className="text-xl text-white mb-2">Le radar des opportunités défense</p>
                        <p className="text-gray-400 mb-8">
                            Appels d'offres du Ministère des Armées, DGA et sécurité intérieure
                        </p>

                        {/* Barre de recherche CENTRÉE */}
                        <div className="max-w-2xl mx-auto mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 blur-2xl rounded-3xl"></div>
                                <div className="relative flex items-center bg-slate-800/50 border border-slate-700 rounded-full px-4 py-3">
                                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher : drones, cybersécurité, uniformes, blindés..."
                                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                                    />
                                    <button
                                        onClick={() => setIsScanModalOpen(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                                    >
                                        <Sparkles className="w-4 h-4" /> Scan IA
                                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">BETA</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Section: Déjà analysés par l'IA */}
                {analysedMarches.length > 0 && (
                    <section className="max-w-[1400px] mx-auto px-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Déjà analysés par l'IA</h2>
                                <span className="text-sm text-gray-500">({analysedMarches.length})</span>
                            </div>
                            <span className="text-xs text-gray-500">Score de compatibilité calculé</span>
                        </div>

                        {/* Horizontal scroll */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                            {analysedMarches.map((marche) => (
                                <Link
                                    key={marche.marcheId}
                                    href={`/repondre?marcheId=${marche.marcheId}`}
                                    className="flex-shrink-0 w-72 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/50 transition-all group"
                                >
                                    {/* Header avec score */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${marche.scoreCompatibilite >= 70 ? 'bg-green-500/20 text-green-400' :
                                            marche.scoreCompatibilite >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-amber-400'
                                            }`}>
                                            {marche.scoreCompatibilite}%
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${marche.difficulte === 'facile' ? 'bg-green-500/10 text-green-400' :
                                            marche.difficulte === 'moyen' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-red-500/10 text-amber-400'
                                            }`}>
                                            {marche.difficulte}
                                        </span>
                                    </div>

                                    {/* Titre */}
                                    <h3 className="font-medium text-white text-sm line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
                                        {marche.titre}
                                    </h3>

                                    {/* Acheteur */}
                                    <p className="text-xs text-gray-500 mb-3 truncate">{marche.acheteur}</p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                            Analysé récemment
                                        </span>
                                        <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                                            Voir →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* AI Scan Modal */}
                {
                    isScanModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* Overlay */}
                            <div
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                                onClick={() => setIsScanModalOpen(false)}
                            ></div>

                            {/* Modal Content */}
                            <div className="relative bg-white dark:bg-[#14181F] border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsScanModalOpen(false)}
                                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Sparkles className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Scan Intelligent IA</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Notre IA analyse votre profil entreprise et trouve automatiquement les marchés où vous avez le plus de chances de gagner.
                                    </p>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-4 mb-8">
                                    {[
                                        "Score de compatibilité pour chaque marché",
                                        "Analyse de vos certifications et références",
                                        "Recommandations personnalisées quotidiennes",
                                        "Alertes quand un marché parfait est publié"
                                    ].map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                            </div>
                                            <span className="text-sm text-slate-300">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="text-center">
                                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 mb-3">
                                        Créer mon profil gratuit
                                    </button>
                                    <p className="text-[10px] text-slate-500">Gratuit • 2 minutes • Sans CB</p>
                                </div>
                            </div>
                        </div>
                    )
                }


                {/* Section 1: Publiés Aujourd'hui (Using filtered data or Just Dropped) */}
                <section id="marches-grid" className="max-w-[1400px] mx-auto px-6 mb-16">
                    {/* Header + Filters Container */}
                    <div>
                        {/* Titre */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Marchés défense
                            </h2>
                            <span className="text-gray-500 text-sm">
                                {filteredTenders.length} marché{filteredTenders.length > 1 ? 's' : ''} trouvé{filteredTenders.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Ligne 1 : Filtres par entité */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {([
                                { id: 'all', label: 'Tout' },
                                { id: 'terre', label: 'Terre' },
                                { id: 'marine', label: 'Marine' },
                                { id: 'air', label: 'Air' },
                                { id: 'dga', label: 'DGA' },
                                { id: 'interieur', label: 'Intérieur' },
                                { id: 'joue', label: 'JOUE' },
                                { id: 'cyber', label: 'Cyber' },
                            ] as const).map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => updateFilter('entity', filters.entity === filter.id && filter.id !== 'all' ? 'all' : filter.id)}
                                    className={`px-5 py-2.5 text-base rounded-full font-medium transition-all ${filters.entity === filter.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* Ligne 2 : Filtres par nature + Favoris */}
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            {/* Nature */}
                            {([
                                { id: 'all', label: 'Tous types', icon: null },
                                { id: 'fournitures', label: 'Fournitures', icon: PackageIcon },
                                { id: 'services', label: 'Services', icon: Briefcase },
                                { id: 'travaux', label: 'Travaux', icon: HardHat },
                            ] as const).map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => updateFilter('nature', filters.nature === filter.id && filter.id !== 'all' ? 'all' : filter.id)}
                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${filters.nature === filter.id
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                        : 'bg-slate-800/50 text-gray-400 border border-slate-700 hover:bg-slate-700'
                                        }`}
                                >
                                    {filter.icon && <filter.icon className="w-4 h-4" />}
                                    {filter.label}
                                </button>
                            ))}

                            {/* Séparateur */}
                            <div className="h-6 w-px bg-slate-700 mx-2"></div>

                            {/* Source (BOAMP / PLACE) */}
                            {([
                                { id: 'all', label: 'Toutes sources', color: '' },
                                { id: 'BOAMP', label: 'BOAMP', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
                                { id: 'PLACE', label: 'PLACE', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
                            ] as { id: SourceFilter; label: string; color: string }[]).map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => updateFilter('source', filters.source === filter.id && filter.id !== 'all' ? 'all' : filter.id)}
                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${filters.source === filter.id
                                        ? filter.color || 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                        : 'bg-slate-800/50 text-gray-400 border border-slate-700 hover:bg-slate-700'
                                        } border`}
                                >
                                    <Database className="w-4 h-4" />
                                    {filter.label}
                                </button>
                            ))}

                            {/* Séparateur */}
                            <div className="h-6 w-px bg-slate-700 mx-2"></div>

                            {/* Bouton Favoris (si connecté) */}
                            {isSignedIn && (
                                <button
                                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                                        showFavoritesOnly
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                            : 'bg-slate-800/50 text-gray-400 border border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-400' : ''}`} />
                                    Favoris {favorites.length > 0 && `(${favorites.length})`}
                                </button>
                            )}

                            {/* Bouton reset si filtres actifs */}
                            {(filters.entity !== 'all' || filters.nature !== 'all' || filters.source !== 'all' || showFavoritesOnly || timeFilter || sortBy !== 'pertinence') && (
                                <button
                                    onClick={() => {
                                        const resetFilters = { entity: 'all' as EntityFilter, amount: 'all' as AmountFilter, nature: 'all' as NatureFilter, source: 'all' as SourceFilter };
                                        setFilters(resetFilters);
                                        setShowFavoritesOnly(false);
                                        setTimeFilter(null);
                                        setSortBy('pertinence');
                                        updateURL(resetFilters, debouncedSearch, 'pertinence', null);
                                    }}
                                    className="px-4 py-2 text-sm rounded-lg font-medium text-amber-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-colors"
                                >
                                    ✕ Reset
                                </button>
                            )}
                        </div>

                        {/* Ligne 3 : Filtres temporels + Tri */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">Filtres rapides :</span>

                                <button
                                    onClick={() => handleTimeFilterChange(timeFilter === 'today' ? null : 'today')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                                        timeFilter === 'today'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                                    }`}
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Publié ce jour
                                </button>

                                <button
                                    onClick={() => handleTimeFilterChange(timeFilter === 'urgent' ? null : 'urgent')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                                        timeFilter === 'urgent'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                                    }`}
                                >
                                    <Clock className="w-4 h-4" />
                                    Clôture &lt; 7 jours
                                </button>
                            </div>

                            {/* Sélecteur de tri */}
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                    className="text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:border-blue-500"
                                >
                                    {Object.entries(SORT_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Grid des cards de marchés avec skeleton loader */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 animate-pulse h-[240px]">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-700 rounded"></div>
                                                <div className="h-3 bg-slate-700 rounded w-24"></div>
                                            </div>
                                            <div className="h-5 bg-slate-700 rounded w-12"></div>
                                        </div>
                                        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
                                        <div className="mt-auto pt-4 border-t border-slate-700 flex justify-between">
                                            <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                            <div className="h-3 bg-slate-700 rounded w-12"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredTenders.slice(0, visibleCount).map((tender) => {
                                    const daysLeft = getDaysRemaining(tender.deadlineDate);
                                    const isUrgent = daysLeft !== null && daysLeft <= 7;
                                    const isMedium = daysLeft !== null && daysLeft > 7 && daysLeft <= 14;

                                    // Couleurs par type de marché
                                    const natureColors: Record<string, string> = {
                                        fournitures: 'border-l-violet-500',
                                        services: 'border-l-blue-500',
                                        travaux: 'border-l-orange-500'
                                    };
                                    const natureBadgeColors: Record<string, string> = {
                                        fournitures: 'bg-violet-500/10 text-violet-400',
                                        services: 'bg-blue-500/10 text-blue-400',
                                        travaux: 'bg-orange-500/10 text-orange-400'
                                    };

                                    // Formater la date limite
                                    const formatDeadline = (dateStr: string) => {
                                        const date = new Date(dateStr);
                                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                                    };

                                    return (
                                        <div
                                            key={tender.id}
                                            onClick={() => setSelectedTender(tender)}
                                            className={`relative bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 border-l-4 ${tender.marketNature ? natureColors[tender.marketNature] : 'border-l-gray-400'} rounded-xl p-6 transition-all duration-200 flex flex-col group cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-500/50 min-h-[220px]`}
                                        >
                                            {/* Header: Acheteur + Favoris */}
                                            <div className="flex items-start justify-between mb-3">
                                                {tender.buyer.id ? (
                                                    <Link
                                                        href={`/acheteurs/${tender.buyer.id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 pr-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        {tender.buyer.name}
                                                    </Link>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 pr-2">
                                                        {tender.buyer.name}
                                                    </p>
                                                )}
                                                {/* Bouton favoris toujours visible */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isSignedIn) {
                                                            toggleFavorite(tender);
                                                        } else {
                                                            window.location.href = '/sign-in';
                                                        }
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                                                        isFavorite(tender.id)
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10'
                                                    }`}
                                                    title={isSignedIn ? (isFavorite(tender.id) ? 'Retirer des favoris' : 'Ajouter aux favoris') : 'Connectez-vous pour ajouter aux favoris'}
                                                >
                                                    <Star className={`w-5 h-5 ${isFavorite(tender.id) ? 'fill-yellow-400' : ''}`} />
                                                </button>
                                            </div>

                                            {/* Titre - hauteur flexible pour voir en entier */}
                                            <h3 className="text-base font-medium text-gray-900 dark:text-white leading-snug mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3 flex-1">
                                                {tender.title}
                                            </h3>

                                            {/* Badges: Source + type de marché */}
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {/* Badge PLACE si source PLACE */}
                                                {tender.source === 'PLACE' && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                        <Database className="w-3 h-3" />
                                                        PLACE
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${tender.marketNature ? natureBadgeColors[tender.marketNature] : 'bg-gray-500/10 text-gray-400'}`}>
                                                    {getMarketNatureLabel(tender.marketNature) || 'Non spécifié'}
                                                </span>
                                            </div>

                                            {/* Footer: Date limite */}
                                            <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                                                <div className={`text-sm font-medium ${
                                                    isUrgent
                                                        ? 'text-amber-500'
                                                        : isMedium
                                                            ? 'text-orange-500'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                    {tender.deadlineDate ? (
                                                        <>
                                                            {formatDeadline(tender.deadlineDate)}
                                                            <span className={`ml-2 text-xs font-bold ${
                                                                isUrgent
                                                                    ? 'text-amber-400'
                                                                    : isMedium
                                                                        ? 'text-orange-400'
                                                                        : 'text-gray-500'
                                                            }`}>
                                                                (J{daysLeft !== null && daysLeft >= 0 ? `-${daysLeft}` : '-N/A'})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Date non spécifiée</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredTenders.length === 0 && (
                                    <div className="col-span-3 text-center py-10 text-slate-500">
                                        Aucun marché trouvé pour ces critères.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bouton Afficher plus */}
                        {!loading && filteredTenders.length > visibleCount && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 border border-slate-700"
                                >
                                    Afficher plus
                                    <span className="text-sm text-gray-400">
                                        ({visibleCount} / {filteredTenders.length})
                                    </span>
                                </button>
                            </div>
                        )}
                    </div >
                </section >



                {/* CTA / Footer Area - Only show if not signed in */}
                {!isSignedIn && (
                    <section className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0B0D11] transition-colors">
                        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                            <h2 className="text-3xl font-medium text-slate-900 dark:text-white tracking-tight mb-4">Ne manquez plus aucun appel d'offre stratégique.</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">Créez votre compte TenderSpotter et commencez à répondre aux marchés défense dès aujourd'hui.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/sign-up" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
                                    Créer mon compte gratuit
                                </Link>
                                <Link href="/marches" className="bg-transparent border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white px-8 py-4 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                    Voir les marchés
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-6">Gratuit • 5 générations DC1/DC2 offertes • Sans engagement</p>
                        </div>
                    </section>
                )}
            </main>

            {/* Tender Detail Modal */}
            {
                selectedTender && (
                    <TenderDetailModal
                        tender={selectedTender}
                        onClose={() => setSelectedTender(null)}
                    />
                )
            }
        </div >
    );
}
