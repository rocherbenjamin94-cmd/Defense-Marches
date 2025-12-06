'use client';

import { X, Building2, Globe, Bell, ExternalLink, ArrowRight } from 'lucide-react';
import { BuyerLocation } from '@/lib/buyers';
import Link from 'next/link';
import clsx from 'clsx';
import Badge from './Badge';

interface BuyerPanelProps {
    buyer: BuyerLocation | null;
    onClose: () => void;
}

const FAMILY_LABELS = {
    armees: 'Armées',
    interieur: 'Intérieur',
    renseignement: 'Renseignement',
    etablissements: 'Établissements',
    collectivites: 'Collectivités',
    mixte: 'Mixte',
};

const FAMILY_COLORS = {
    armees: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    interieur: 'text-red-400 bg-red-400/10 border-red-400/20',
    renseignement: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    etablissements: 'text-green-400 bg-green-400/10 border-green-400/20',
    collectivites: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    mixte: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

export default function BuyerPanel({ buyer, onClose }: BuyerPanelProps) {
    if (!buyer) return null;

    const familyStyle = FAMILY_COLORS[buyer.famille] || FAMILY_COLORS.mixte;

    return (
        <div className={clsx(
            "fixed top-[70px] right-0 bottom-0 w-[450px] bg-[#0B0D11] border-l border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col",
            buyer ? "translate-x-0" : "translate-x-full"
        )}>
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between bg-[#14181F]">
                <div className="flex-1 pr-4">
                    <div className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3", familyStyle)}>
                        {FAMILY_LABELS[buyer.famille]}
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight mb-1">
                        {buyer.nom}
                    </h2>
                    {buyer.parent && (
                        <p className="text-sm text-slate-400">{buyer.parent}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                {/* Info Block */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informations</h3>
                    <div className="grid gap-3">
                        <div className="flex items-center text-slate-300 text-sm">
                            <Building2 className="h-4 w-4 mr-3 text-slate-500" />
                            {buyer.adresse} ({buyer.departement})
                        </div>
                        {buyer.website && (
                            <a href={buyer.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors">
                                <Globe className="h-4 w-4 mr-3" />
                                Site web officiel <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        )}
                        <div className="flex items-center text-slate-300 text-sm">
                            <span className="w-4 mr-3 text-center text-slate-500">📋</span>
                            <span>{buyer.activeTenders} marchés actifs</span>
                        </div>
                        {buyer.totalAmount && (
                            <div className="flex items-center text-slate-300 text-sm">
                                <span className="w-4 mr-3 text-center text-slate-500">💰</span>
                                <span>~{(buyer.totalAmount / 1000000).toFixed(1)}M€ en cours (estimé)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Tenders (Mocked for now based on buyer) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marchés en cours</h3>
                    <div className="space-y-3">
                        {/* Mock Tender 1 */}
                        <div className="bg-[#14181F] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="!text-[10px] !px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">J-6</Badge>
                                <span className="text-[10px] text-slate-500">Procédure adaptée</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                                Maintenance des équipements de sécurité incendie
                            </h4>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">150k€ - 500k€</span>
                                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Voir</span>
                            </div>
                        </div>

                        {/* Mock Tender 2 */}
                        <div className="bg-[#14181F] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="!text-[10px] !px-1.5 border-white/10 text-slate-400">J-14</Badge>
                                <span className="text-[10px] text-slate-500">Appel d'offres</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                                Acquisition de composants électroniques durcis
                            </h4>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">&gt; 1M€</span>
                                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Voir</span>
                            </div>
                        </div>
                    </div>

                    <Link href={`/acheteurs/${buyer.id}`} className="w-full py-2 text-xs font-bold text-slate-300 hover:text-white border border-white/10 rounded-lg hover:bg-[#1A1E26] transition-all flex items-center justify-center gap-2">
                        Voir tous les marchés de cet acheteur <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-[#14181F]">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                    <Bell className="h-4 w-4" />
                    Créer une alerte pour cet acheteur
                </button>
            </div>
        </div>
    );
}
