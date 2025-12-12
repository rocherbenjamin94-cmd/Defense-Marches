'use client';

import { useEffect, useState } from 'react';
import { X, Building2, ExternalLink, Clock, MapPin, FileText, Lock, ChevronRight, Database } from 'lucide-react';
import { Tender } from '@/lib/types';
import { getAmountRangeLabel, getMarketNatureLabel } from '@/lib/filterLogic';
import Badge from './Badge';
import Toast from './Toast';
import Link from 'next/link';

/**
 * Détermine l'ID de l'acheteur à utiliser pour le lien
 * Pour les marchés PLACE sans buyer.id, on essaie de déduire le ministère
 */
function getBuyerLinkId(tender: Tender): string | null {
    // Si l'acheteur a un ID, l'utiliser
    if (tender.buyer.id) {
        return tender.buyer.id;
    }

    // Mapper les noms d'acheteurs vers les fiches génériques
    const buyerName = tender.buyer.name.toLowerCase();

    // CND - Commissariat au Numérique de Défense
    if (buyerName.includes('/cnd') || buyerName.includes('cnd/') || buyerName.includes('commissariat au numérique')) {
        return 'cnd';
    }

    // SCA - Service du Commissariat des Armées
    if (buyerName.includes('/sca') || buyerName.includes('sca/') || buyerName.includes('commissariat des armées')) {
        return 'sca';
    }

    // SID - Service d'Infrastructure de la Défense
    if (buyerName.includes('/sid') || buyerName.includes('sid/') || buyerName.includes('esid') || buyerName.includes('infrastructure de la défense')) {
        return 'sid-dcsid';
    }

    // SEO - Service de l'Énergie Opérationnelle
    if (buyerName.includes('/seo') || buyerName.includes('seo/') || buyerName.includes('énergie opérationnelle')) {
        return 'seo';
    }

    // DGA - Direction Générale de l'Armement
    if (buyerName.includes('dga') || buyerName.includes('direction générale de l\'armement')) {
        return 'dga';
    }

    // DMAé - Direction de la Maintenance Aéronautique
    if (buyerName.includes('dmaé') || buyerName.includes('dmae') || buyerName.includes('maintenance aéronautique')) {
        return 'dmae';
    }

    // SSA - Service de Santé des Armées
    if (buyerName.includes('/ssa') || buyerName.includes('ssa/') || buyerName.includes('santé des armées')) {
        return 'ssa';
    }

    // SSF - Service de Soutien de la Flotte
    if (buyerName.includes('ssf') || buyerName.includes('soutien de la flotte')) {
        return 'ssf';
    }

    // SIAé - Service Industriel de l'Aéronautique
    if (buyerName.includes('siaé') || buyerName.includes('siae') || buyerName.includes('industriel de l\'aéronautique')) {
        return 'siae';
    }

    // SIMMT - Structure Intégrée du Maintien en condition opérationnelle du Matériel Terrestre
    if (buyerName.includes('simmt') || buyerName.includes('maintien en condition opérationnelle')) {
        return 'simmt';
    }

    // SMITer - Service de la Maintenance Industrielle Terrestre
    if (buyerName.includes('smiter') || buyerName.includes('maintenance industrielle terrestre')) {
        return 'smiter';
    }

    // Marine Nationale
    if (buyerName.includes('marine') || buyerName.includes('bcrm') || buyerName.includes('dssf')) {
        return 'marine-nationale';
    }

    // Armée de Terre
    if (buyerName.includes('armée de terre') || buyerName.includes('bsmat')) {
        return 'armee-terre';
    }

    // Armée de l'Air et de l'Espace
    if (buyerName.includes('armée de l\'air') || buyerName.includes('aia ')) {
        return 'armee-air';
    }

    // MINARM générique (doit être en dernier car moins spécifique)
    if (buyerName.includes('ministère des armées') || buyerName.startsWith('minarm')) {
        return 'minarm';
    }

    // MINDEF (ancien nom)
    if (buyerName.startsWith('mindef')) {
        return 'minarm';
    }

    return null;
}

interface TenderDetailModalProps {
    tender: Tender;
    onClose: () => void;
}

export default function TenderDetailModal({ tender, onClose }: TenderDetailModalProps) {
    const [showToast, setShowToast] = useState(false);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const daysLeft = Math.ceil((new Date(tender.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isUrgent = tender.urgencyLevel === 'critical' || tender.urgencyLevel === 'urgent';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Centered Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4 pointer-events-none">
                <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[900px] bg-[#14181F] md:rounded-2xl border-l-0 md:border border-white/10 shadow-2xl flex flex-col pointer-events-auto transform transition-all duration-250 ease-out animate-in fade-in zoom-in-95">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/10 bg-[#14181F]/95 backdrop-blur sticky top-0 z-10 md:rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            {/* Badge source */}
                            {tender.source === 'PLACE' ? (
                                <Badge variant="outline" className="border-purple-500/50 bg-purple-500/20 text-purple-400">
                                    <Database className="h-3 w-3 mr-1" />
                                    PLACE
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/20 text-emerald-400">
                                    BOAMP
                                </Badge>
                            )}
                            {isUrgent && <Badge variant="destructive">J-{daysLeft}</Badge>}
                            {tender.sectors[0] && <Badge variant="outline" className="border-white/10 text-slate-300">{tender.sectors[0]}</Badge>}
                        </div>

                        <button
                            onClick={onClose}
                            className="flex items-center text-slate-400 hover:text-white transition-colors"
                        >
                            Fermer
                            <X className="h-5 w-5 ml-2" />
                        </button>
                    </div>

                    {/* Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-8 custom-scrollbar">

                        {/* Title & Buyer */}
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
                                {tender.title}
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
                                {(() => {
                                    const buyerId = getBuyerLinkId(tender);
                                    const content = (
                                        <>
                                            <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                                            <span className="font-medium">{tender.buyer.name}</span>
                                            {buyerId && <ChevronRight className="h-4 w-4 ml-1 text-slate-500" />}
                                        </>
                                    );

                                    if (buyerId) {
                                        return (
                                            <Link
                                                href={`/acheteurs/${buyerId}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                                            >
                                                {content}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                            {content}
                                        </div>
                                    );
                                })()}
                                <div className="flex items-center gap-4 text-slate-500">
                                    {tender.source === 'PLACE' ? (
                                        <>
                                            <span className="flex items-center gap-1">
                                                <Database className="h-3 w-3 text-purple-400" />
                                                Réf. PLACE-{tender.id.replace('place-', '')}
                                            </span>
                                            <a
                                                href={tender.boampUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-purple-500 hover:text-purple-400 hover:underline"
                                            >
                                                Voir sur PLACE <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <span>Réf. BOAMP-{tender.id}</span>
                                            <a
                                                href={tender.boampUrl || `https://www.boamp.fr/avis/detail/${tender.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-blue-500 hover:text-blue-400 hover:underline"
                                            >
                                                Voir sur BOAMP <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0B0D11]/50 p-6 rounded-xl border border-white/5">
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Date de publication</span>
                                <div className="flex items-center text-white">
                                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                                    {new Date(tender.publicationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Date limite</span>
                                <div className="flex items-center text-white">
                                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="text-red-400 font-medium">
                                        {new Date(tender.deadlineDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="ml-2 text-xs text-slate-600">(dans {daysLeft} jours)</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Lieu d'exécution</span>
                                <div className="flex items-center text-white">
                                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                                    {tender.buyer.department || 'National'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Procédure</span>
                                <div className="flex items-center text-white">
                                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                                    {tender.procedureType || 'Non spécifié'}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Objet du marché</h2>
                            <div className="bg-[#0B0D11]/50 p-6 rounded-xl border border-white/5 text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                {tender.description}
                                <p className="mt-4 text-sm text-slate-500 italic">
                                    Description complète disponible sur l'avis officiel {tender.source === 'PLACE' ? 'PLACE' : 'BOAMP'}.
                                </p>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Informations complémentaires</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 mb-1">Code CPV</span>
                                    <span className="font-mono text-sm text-blue-400">{tender.cpv || 'Non spécifié'}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 mb-1">Nature</span>
                                    <span className="text-sm text-white">{getMarketNatureLabel(tender.marketNature)}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 mb-1">Fourchette</span>
                                    <span className="text-sm text-white">{getAmountRangeLabel(tender.amountRange)}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 mb-1">Montant estimé</span>
                                    <span className="text-sm text-white">{tender.estimatedAmount ? `${(tender.estimatedAmount / 1000000).toFixed(1)}M€` : 'NC'}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-6 md:px-10 py-6 border-t border-white/10 bg-[#14181F]/95 backdrop-blur sticky bottom-0 z-10 md:rounded-b-2xl">
                        <a
                            href={`/repondre?marcheId=${tender.id}&acheteur=${encodeURIComponent(tender.buyer.name)}&objet=${encodeURIComponent(tender.title)}&dateLimite=${tender.deadlineDate}`}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors mb-3 shadow-lg shadow-blue-600/20"
                        >
                            Répondre à cet AO <ChevronRight className="h-5 w-5" />
                        </a>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                            <Lock className="h-3 w-3" />
                            Génération automatique DC1/DC2 — Disponible
                        </div>
                    </div>

                </div>
            </div>

            <Toast
                message="Fonctionnalité en cours de développement. Inscrivez-vous pour être notifié !"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    );
}
