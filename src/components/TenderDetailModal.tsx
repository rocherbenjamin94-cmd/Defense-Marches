'use client';

import { useEffect, useState } from 'react';
import { X, Star, Building2, ExternalLink, Clock, MapPin, FileText, Lock, ChevronRight } from 'lucide-react';
import { Tender } from '@/lib/types';
import Badge from './Badge';
import Toast from './Toast';

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
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Centered Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4 pointer-events-none">
                <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[900px] bg-[#0a0a0f] md:rounded-2xl border-l-0 md:border border-navy-700 shadow-2xl flex flex-col pointer-events-auto transform transition-all duration-250 ease-out animate-in fade-in zoom-in-95">

                    {/* Header */}
                    <div className="flex items-center justify-between px-10 py-4 border-b border-navy-700 bg-navy-900/95 backdrop-blur sticky top-0 z-10 md:rounded-t-2xl">
                        <button
                            onClick={onClose}
                            className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5 mr-2" />
                            Fermer
                        </button>

                        <div className="flex items-center gap-3">
                            {isUrgent && <Badge variant="destructive">J-{daysLeft}</Badge>}
                            <Badge variant="outline">{tender.sectors[0]}</Badge>
                            <button className="p-2 text-gray-400 hover:text-gold-500 transition-colors border border-navy-600 rounded-lg hover:border-gold-500">
                                <Star className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">

                        {/* Title & Buyer */}
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
                                {tender.title}
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
                                <div className="flex items-center text-gray-300 bg-navy-800 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-navy-700 transition-colors">
                                    <Building2 className="h-4 w-4 mr-2 text-gold-500" />
                                    <span className="font-medium">{tender.buyer.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-500">
                                    <span>Réf. BOAMP-{tender.id}</span>
                                    <a
                                        href={`https://www.boamp.fr/avis/detail/${tender.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-gold-500 hover:text-gold-400 hover:underline"
                                    >
                                        Voir sur BOAMP <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121218] p-6 rounded-xl border border-navy-700">
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Date de publication</span>
                                <div className="flex items-center text-white">
                                    <Clock className="h-4 w-4 mr-2 text-navy-400" />
                                    {new Date(tender.publicationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Date limite</span>
                                <div className="flex items-center text-white">
                                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="text-red-400 font-medium">
                                        {new Date(tender.deadlineDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">(dans {daysLeft} jours)</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Lieu d'exécution</span>
                                <div className="flex items-center text-white">
                                    <MapPin className="h-4 w-4 mr-2 text-navy-400" />
                                    {tender.buyer.department || 'National'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Procédure</span>
                                <div className="flex items-center text-white">
                                    <FileText className="h-4 w-4 mr-2 text-navy-400" />
                                    {tender.procedureType || 'Non spécifié'}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Objet du marché</h2>
                            <div className="bg-[#121218] p-6 rounded-xl border border-navy-700 text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                {tender.description}
                                <p className="mt-4 text-sm text-gray-500 italic">
                                    Description complète disponible sur l'avis officiel BOAMP.
                                </p>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Informations complémentaires</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-navy-800/50 p-4 rounded-lg border border-navy-700">
                                    <span className="block text-xs text-gray-500 mb-1">Code CPV</span>
                                    <span className="font-mono text-sm text-gold-500">35000000-4</span>
                                </div>
                                <div className="bg-navy-800/50 p-4 rounded-lg border border-navy-700">
                                    <span className="block text-xs text-gray-500 mb-1">Durée</span>
                                    <span className="text-sm text-white">48 mois</span>
                                </div>
                                <div className="bg-navy-800/50 p-4 rounded-lg border border-navy-700">
                                    <span className="block text-xs text-gray-500 mb-1">Variantes</span>
                                    <span className="text-sm text-white">Non autorisées</span>
                                </div>
                                <div className="bg-navy-800/50 p-4 rounded-lg border border-navy-700">
                                    <span className="block text-xs text-gray-500 mb-1">Montant</span>
                                    <span className="text-sm text-white">{tender.estimatedAmount ? `${(tender.estimatedAmount / 1000000).toFixed(1)}M€` : 'NC'}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-10 py-6 border-t border-navy-700 bg-navy-900/95 backdrop-blur sticky bottom-0 z-10 md:rounded-b-2xl">
                        <a
                            href={`/repondre/dc1?marcheId=${tender.id}&acheteur=${encodeURIComponent(tender.buyer.name)}&objet=${encodeURIComponent(tender.title)}&dateLimite=${tender.deadlineDate}`}
                            className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold py-3.5 rounded-lg transition-colors mb-3"
                        >
                            Répondre à cet AO <ChevronRight className="h-5 w-5" />
                        </a>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Lock className="h-3 w-3" />
                            Génération automatique DC1/DC2 — Bientôt disponible
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
