'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Radio, PlusCircle, Clock, Map as MapIcon, Sparkles, ChevronRight, AlertCircle, Twitter, Linkedin, Building2, Flame, TrendingUp, Terminal, Shield, Anchor, Plane, Lock, BadgeCheck, Truck, Wrench, Package, Home, X, Check } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { Tender } from "@/lib/types";
import { fetchDefenseTenders } from "@/lib/boamp";
import { filterTenders, FilterType } from "@/lib/filterLogic";
import { categorizeTenders } from "@/lib/categorization";
import FranceMapWidget from './dashboard/FranceMapWidget';

// Helper to format currency
const formatBudget = (budget?: number) => {
    if (!budget) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(budget);
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

// Helper to get icon based on tender title/content
const getTenderIcon = (title: string, category?: string) => {
    const t = title.toLowerCase();

    if (t.includes('naval') || t.includes('marine') || t.includes('flotte') || t.includes('sous-marin')) return Anchor;
    if (t.includes('aérien') || t.includes('avion') || t.includes('hélicoptère') || t.includes('drone') || t.includes('mrtt')) return Plane;
    if (t.includes('cyber') || t.includes('informatique') || t.includes('réseau') || t.includes('logiciel')) return Lock;
    if (t.includes('dga') || t.includes('armement') || t.includes('munition')) return Building2;
    if (t.includes('gendarmerie') || t.includes('police') || t.includes('intérieur')) return BadgeCheck;
    if (t.includes('radio') || t.includes('transmission') || t.includes('communication')) return Radio;
    if (t.includes('transport') || t.includes('véhicule') || t.includes('camion')) return Truck;
    if (t.includes('maintenance') || t.includes('réparation') || t.includes('entretien')) return Wrench;
    if (t.includes('fourniture') || t.includes('équipement') || t.includes('habillement')) return Package;

    return Shield;
};

export default function TenderSpotterHome() {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    // Load Data
    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchDefenseTenders();
            setTenders(data);
            setLastSync(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Derived State
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        return {
            openCount: tenders.filter(t => t.deadlineDate && new Date(t.deadlineDate) > now).length,
            todayCount: tenders.filter(t => t.publicationDate && t.publicationDate.startsWith(todayStr)).length,
            closingCount: tenders.filter(t => {
                if (!t.deadlineDate) return false;
                const d = new Date(t.deadlineDate);
                return d >= now && d <= nextWeek;
            }).length,
        };
    }, [tenders]);

    const filteredTenders = useMemo(() => {
        let res = filterTenders(tenders, activeFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(t =>
                (t.title?.toLowerCase().includes(q) || false) ||
                (t.buyer?.name.toLowerCase().includes(q) || false) ||
                (t.description?.toLowerCase().includes(q) || false)
            );
        }
        return res;
    }, [tenders, activeFilter, searchQuery]);

    const categories = useMemo(() => categorizeTenders(filteredTenders), [filteredTenders]);

    // Top Lists
    const todaysTenders = useMemo(() => {
        return categories.justDropped.length > 0 ? categories.justDropped : filteredTenders.slice(0, 4);
    }, [categories, filteredTenders]);

    return (
        <div className="min-h-screen bg-[#0B0D11] text-[#94A3B8] font-sans selection:bg-blue-900/50 selection:text-blue-200">

            {/* Background Ambience */}
            <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

            {/* Main Content */}
            <main className="pt-24 pb-20 relative min-h-screen z-10">

                {/* Hero / Search Section */}
                <section className="relative max-w-5xl mx-auto px-6 mb-16 text-center overflow-visible">

                    {/* Static Radar Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none z-[-1] opacity-50 select-none">
                        {/* Concentric Circles */}
                        <div className="absolute inset-0 rounded-full border border-blue-500/20"></div>
                        <div className="absolute inset-[15%] rounded-full border border-blue-500/20"></div>
                        <div className="absolute inset-[30%] rounded-full border border-blue-500/20"></div>

                        {/* Static Blue Sweep */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.3)_0deg,transparent_60deg,transparent_360deg)] rotate-[-45deg] rounded-full"></div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-400">TENDERSPOTTER</span> <br />
                        Le radar des opportunités <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-400">du secteur défense.</span>
                    </h1>

                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 font-light">
                        Centralisez, analysez et répondez aux appels d'offres du Ministère des Armées, de la DGA et des acteurs de la sécurité intérieure.
                    </p>

                    {/* Search Bar Component */}
                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-[#14181F] border border-white/10 rounded-lg p-2 flex items-center shadow-2xl">
                            <div className="pl-4 text-slate-500">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher : drones, cybersécurité, uniformes, blindés..."
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 px-4 py-3 text-sm focus:outline-none"
                            />

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={() => setIsScanModalOpen(true)}
                                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-900/20 border border-white/10 flex items-center gap-2 group whitespace-nowrap"
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-shimmer"></div>

                                    <Sparkles className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">Scan IA</span>
                                    <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded ml-1 relative z-10 font-bold tracking-wide">BETA</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Scan Modal */}
                    {isScanModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* Overlay */}
                            <div
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                                onClick={() => setIsScanModalOpen(false)}
                            ></div>

                            {/* Modal Content */}
                            <div className="relative bg-[#14181F] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
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
                                    <h2 className="text-2xl font-bold text-white mb-2">Scan Intelligent IA</h2>
                                    <p className="text-sm text-slate-400">
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
                    )}

                    {/* Real-time Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
                        <div className="bg-[#14181F]/50 border border-white/5 p-4 rounded-lg backdrop-blur-sm">
                            <div className="text-2xl font-semibold text-white tracking-tight">{stats.openCount}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                                <Radio className="w-3 h-3 text-emerald-500" /> Marchés ouverts
                            </div>
                        </div>
                        <div className="bg-[#14181F]/50 border border-white/5 p-4 rounded-lg backdrop-blur-sm">
                            <div className="text-2xl font-semibold text-white tracking-tight">{stats.todayCount}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                                <PlusCircle className="w-3 h-3 text-blue-500" /> Publiés ce jour
                            </div>
                        </div>
                        <div className="bg-[#14181F]/50 border border-white/5 p-4 rounded-lg backdrop-blur-sm">
                            <div className="text-2xl font-semibold text-white tracking-tight">{stats.closingCount}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3 text-orange-500" /> Clôture &lt; 7 jours
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 1: Publiés Aujourd'hui (Using filtered data or Just Dropped) */}
                <section className="max-w-[1400px] mx-auto px-6 mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-medium text-white tracking-tight">Publiés aujourd'hui</h2>
                        <span className="bg-slate-800 text-xs px-2 py-1 rounded text-gray-300">{filteredTenders.length}</span>
                        <a href="#" className="ml-auto text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></a>
                    </div>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[
                            { id: 'all', label: 'Tout voir' },
                            { id: 'armees', label: 'Armée de Terre' },
                            { id: 'naval', label: 'Marine Nationale' },
                            { id: 'aerien', label: "Armée de l'Air & Espace" },
                            { id: 'dga', label: 'DGA' },
                            { id: 'interieur', label: 'Gendarmerie / Intérieur' },
                            { id: 'cyber', label: 'Cyberdéfense' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id as FilterType)}
                                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors border ${activeFilter === filter.id
                                    ? 'bg-white text-slate-900 border-white'
                                    : 'bg-slate-800 text-gray-300 border-slate-600 hover:border-blue-500'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredTenders.slice(0, 8).map((tender) => {
                            const daysLeft = getDaysRemaining(tender.deadlineDate);
                            const isUrgent = daysLeft !== null && daysLeft <= 7;
                            const isNew = true; // Simplified for now
                            const CategoryIcon = getTenderIcon(tender.title);

                            return (
                                <div key={tender.id} className="bg-[#14181F] border border-white/5 rounded-xl p-5 card-hover transition-all duration-300 flex flex-col justify-between group cursor-pointer h-[240px]">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-colors">
                                                    <CategoryIcon className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <div className="text-xs text-slate-400 line-clamp-1">{tender.buyer.name}</div>
                                            </div>
                                            {isUrgent ? (
                                                <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-semibold tracking-wide">URGENT</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold tracking-wide">NEW</span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-medium text-white leading-snug mb-3 group-hover:text-blue-400 transition-colors line-clamp-3">
                                            {tender.title}
                                        </h3>
                                        <div className="flex gap-2 mb-4">
                                            {/* Tags Mockup based on text analysis or generic */}
                                            <span className="text-[10px] text-slate-500 border border-white/5 px-1.5 py-0.5 rounded line-clamp-1 max-w-[100px]">{tender.cpv || "Marché Public"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-[11px] text-slate-500">
                                            Lieu: <span className="text-slate-300">{tender.location || "France"}</span>
                                        </div>
                                        <div className={`text-[11px] flex items-center gap-1 font-medium ${isUrgent ? 'text-orange-400' : 'text-slate-400'}`}>
                                            {isUrgent ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {daysLeft !== null ? `${daysLeft}j` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredTenders.length === 0 && (
                            <div className="col-span-4 text-center py-10 text-slate-500">
                                Aucun marché trouvé pour ces critères.
                            </div>
                        )}
                    </div>
                </section>

                {/* Bento Grid / Feature Highlights */}
                <section className="max-w-[1400px] mx-auto px-6 mb-16">
                    <h2 className="text-xl font-medium text-white tracking-tight mb-6">Intelligence Marché</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[400px]">

                        {/* Map Feature */}
                        <div className="md:col-span-2 bg-[#14181F] rounded-2xl border border-white/5 p-6 relative overflow-hidden group flex flex-col">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
                            <div className="relative z-10 flex flex-col h-full pointer-events-none">
                                <div className="flex items-center justify-between mb-4 pointer-events-auto">
                                    <div className="flex items-center gap-2 text-white font-medium">
                                        <MapIcon className="w-4 h-4 text-blue-500" /> Cartographie
                                    </div>
                                    <button className="text-xs text-slate-500 hover:text-white transition-colors">Agrandir</button>
                                </div>
                                <p className="text-sm text-slate-400 mb-4 max-w-sm">Visualisez géographiquement les marchés pour optimiser votre logistique et identifier les clusters régionaux.</p>

                                {/* France Map Visual */}
                                <div className="flex-1 rounded-lg relative overflow-hidden flex items-center justify-center -m-1 pointer-events-auto">
                                    <FranceMapWidget />
                                </div>
                            </div>
                        </div>

                        {/* Smart Search Feature */}
                        <div className="bg-[#14181F] rounded-2xl border border-white/5 p-6 relative overflow-hidden flex flex-col h-full">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-2 text-white font-medium mb-2">
                                    <Sparkles className="w-4 h-4 text-blue-500" /> Recherche Intelligente
                                </div>
                                <p className="text-sm text-slate-400 mb-2">Notre IA analyse votre profil et calcule votre compatibilité avec chaque marché.</p>
                                <p className="text-xs text-slate-500 mb-6 font-medium">Basé sur : secteur d'activité, certifications, historique de réponses</p>

                                <div className="space-y-4 mb-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-300">
                                            <span>Maintenance systèmes radar THALES</span>
                                            <span className="text-emerald-400 font-bold">94%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#0F1115] rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[94%] rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 filter blur-sm opacity-60 select-none pointer-events-none">
                                        <div className="flex justify-between text-xs text-slate-300">
                                            <span>Fourniture uniformes Gendarmerie</span>
                                            <span className="text-amber-500 font-bold">67%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#0F1115] rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 w-[67%] rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 filter blur-sm opacity-60 select-none pointer-events-none">
                                        <div className="flex justify-between text-xs text-slate-300">
                                            <span>Développement logiciel embarqué</span>
                                            <span className="text-slate-500 font-bold">45%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#0F1115] rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-500 w-[45%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
                                        Créer mon profil entreprise
                                    </button>
                                    <p className="text-[10px] text-slate-500 text-center mt-3">Gratuit • 2 minutes • Sans CB</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Section 2: Ministère des Armées Specific */}
                {/* Only show if we have data for it */}
                {
                    (categories.ministryArmies.length > 0) && (
                        <section className="max-w-[1400px] mx-auto px-6 mb-20">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-medium text-white tracking-tight flex items-center gap-2">
                                    Ministère des Armées
                                    <span className="text-xs font-normal text-slate-500 border border-white/10 px-2 py-0.5 rounded ml-2">Focus</span>
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                {categories.ministryArmies.slice(0, 3).map(tender => {
                                    const daysLeft = getDaysRemaining(tender.deadlineDate);
                                    const CategoryIcon = getTenderIcon(tender.title);
                                    return (
                                        <div key={tender.id} className="group bg-[#14181F] border border-white/5 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-slate-600 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4 mb-3 md:mb-0">
                                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-colors shrink-0">
                                                    <CategoryIcon className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                                        {tender.title}
                                                    </h3>
                                                    <div className="text-xs text-slate-500 mt-1">{tender.buyer.name} • {tender.location || 'France'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">Défense</span>
                                                </div>
                                                {daysLeft !== null && (
                                                    <div className={`text-xs font-medium px-3 py-1 rounded border overflow-hidden ${daysLeft < 15
                                                        ? "bg-orange-600/20 text-orange-300 border-orange-500/20"
                                                        : "bg-blue-600/20 text-blue-300 border-blue-500/20"
                                                        }`}>
                                                        {daysLeft}j restants
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )
                }

                {/* CTA / Footer Area */}
                <section className="border-t border-white/5 bg-[#0B0D11]">
                    <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                        <h2 className="text-3xl font-medium text-white tracking-tight mb-4">Ne manquez plus aucun appel d'offre stratégique.</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Créez votre profil TenderSpotter, configurez vos alertes mots-clés et recevez les marchés pertinents chaque matin.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button className="bg-white text-black px-6 py-3 rounded-md text-sm font-bold hover:bg-slate-200 transition-colors">
                                Commencer l'essai gratuit
                            </button>
                            <button className="bg-transparent border border-white/10 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-white/5 transition-colors">
                                Voir la démo
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-6">Aucune carte bancaire requise. 14 jours d'essai offert.</p>
                    </div>
                </section>

            </main >

            {/* Footer handled globally in layout.tsx */}
        </div >
    );
}
