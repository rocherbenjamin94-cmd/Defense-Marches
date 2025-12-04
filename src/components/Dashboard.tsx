'use client';

import { useState, useMemo, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import FilterBar from "@/components/FilterBar";
import TenderCard from "@/components/TenderCard";
import CategoryCard from "@/components/CategoryCard";
import SkeletonCard from "@/components/SkeletonCard";
import Section from "@/components/Section";
import { categorizeTenders } from "@/lib/categorization";
import { filterTenders, FilterType } from "@/lib/filterLogic";
import { useFilter } from "@/components/FilterProvider";
import { Tender } from "@/lib/types";
import { fetchDefenseTenders } from "@/lib/boamp";
import { Flame, Zap, Shield, Building2, TrendingUp, Terminal, Truck, Anchor, Plane, Crosshair, Server, Cpu, RefreshCw, AlertCircle } from "lucide-react";

const CATEGORIES = [
    { id: 'vehicles', name: 'Véhicules', icon: Truck, count: 12 },
    { id: 'naval', name: 'Naval', icon: Anchor, count: 8 },
    { id: 'air', name: 'Aérien', icon: Plane, count: 15 },
    { id: 'weapons', name: 'Armement', icon: Crosshair, count: 5 },
    { id: 'cyber', name: 'IT & Cyber', icon: Server, count: 24 },
    { id: 'electronics', name: 'Systèmes', icon: Cpu, count: 10 },
];

export default function Dashboard() {
    const { activeFilter } = useFilter();
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDefenseTenders();
            setTenders(data);
            setLastSync(new Date());
        } catch (err) {
            setError("Impossible de charger les marchés. Veuillez vérifier votre connexion.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30 * 60 * 1000); // Refresh every 30 mins
        return () => clearInterval(interval);
    }, []);

    // Calculate counts for all filters (for the badges)
    const counts = useMemo(() => {
        const c: Record<FilterType, number> = {
            all: tenders.length,
            urgent: filterTenders(tenders, 'urgent').length,
            armees: filterTenders(tenders, 'armees').length,
            interieur: filterTenders(tenders, 'interieur').length,
            dga: filterTenders(tenders, 'dga').length,
            cyber: filterTenders(tenders, 'cyber').length,
            naval: filterTenders(tenders, 'naval').length,
            aerien: filterTenders(tenders, 'aerien').length,
        };
        return c;
    }, [tenders]);

    // Filter tenders based on active selection
    const filteredTenders = useMemo(() => {
        return filterTenders(tenders, activeFilter);
    }, [tenders, activeFilter]);

    // Categorize the filtered tenders for the sections
    const categories = useMemo(() => {
        return categorizeTenders(filteredTenders);
    }, [filteredTenders]);

    // Calculate stats
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
            armyCount: tenders.filter(t =>
                t.buyer.name.toLowerCase().includes('armées') ||
                t.buyer.name.toLowerCase().includes('dga')
            ).length
        };
    }, [tenders]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20">
            <Navbar />
            <StatsBar
                openCount={stats.openCount}
                todayCount={stats.todayCount}
                closingCount={stats.closingCount}
                armyCount={stats.armyCount}
                lastSync={lastSync}
                loading={loading}
            />
            <FilterBar counts={counts} />

            <div className="flex flex-col gap-8 pt-6">

                {/* SECTION 1: TODAY (Top Priority) */}
                {categories.justDropped.length > 0 && (
                    <Section
                        title="⚡ Publiés aujourd'hui"
                        icon={<Zap className="h-5 w-5 text-gold-500" />}
                        actionLabel="Voir tout"
                        actionHref="/search?filter=today"
                        scrollable
                        className="!py-0"
                    >
                        {categories.justDropped.map(t => (
                            <TenderCard key={t.id} tender={t} variant="standard" />
                        ))}
                    </Section>
                )}

                {/* SECTION 2: STRATEGIC BUYERS (2 Columns) */}
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* COL 1: ARMIES */}
                    {categories.ministryArmies.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-navy-700 pb-2">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-gold-500" />
                                    <h2 className="text-lg font-bold text-white">🎯 Ministère des Armées</h2>
                                </div>
                                <span className="text-xs text-gold-500 cursor-pointer hover:underline">Voir tout →</span>
                            </div>
                            <div className="space-y-3">
                                {categories.ministryArmies.slice(0, 5).map(t => (
                                    <TenderCard key={t.id} tender={t} variant="list-item" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COL 2: INTERIOR */}
                    {categories.interiorSecurity.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-navy-700 pb-2">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    <h2 className="text-lg font-bold text-white">🛡️ Sécurité Intérieure</h2>
                                </div>
                                <span className="text-xs text-gold-500 cursor-pointer hover:underline">Voir tout →</span>
                            </div>
                            <div className="space-y-3">
                                {categories.interiorSecurity.slice(0, 5).map(t => (
                                    <TenderCard key={t.id} tender={t} variant="list-item" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 3: URGENTS */}
                {categories.urgents.length > 0 && (
                    <Section
                        title="🔥 Fermeture imminente"
                        icon={<Flame className="h-5 w-5 text-red-500" />}
                        actionLabel="Voir tout"
                        actionHref="/search?filter=urgent"
                        scrollable
                        className="!py-0"
                    >
                        {categories.urgents.map(t => (
                            <TenderCard key={t.id} tender={t} variant="standard" />
                        ))}
                    </Section>
                )}

                {/* SECTION 4: HIGH VALUE */}
                {categories.highValue.length > 0 && (
                    <Section
                        title="💰 À fort enjeu"
                        icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                        scrollable
                        className="!py-0"
                    >
                        {categories.highValue.map(t => (
                            <TenderCard key={t.id} tender={t} variant="large" />
                        ))}
                    </Section>
                )}

                {/* SECTION 4: CYBER */}
                {categories.cyber.length > 0 && (
                    <Section
                        title="🔒 Cybersécurité & Systèmes"
                        icon={<Terminal className="h-5 w-5 text-purple-500" />}
                        scrollable
                        className="!py-0"
                    >
                        {categories.cyber.map(t => (
                            <TenderCard key={t.id} tender={t} variant="standard" />
                        ))}
                    </Section>
                )}

                {/* SECTION 5: CATEGORIES */}
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <h2 className="text-lg font-bold text-white mb-6">Explorer par domaine</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {CATEGORIES.map(cat => (
                            <CategoryCard
                                key={cat.id}
                                id={cat.id}
                                name={cat.name}
                                icon={cat.icon}
                                count={cat.count}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
