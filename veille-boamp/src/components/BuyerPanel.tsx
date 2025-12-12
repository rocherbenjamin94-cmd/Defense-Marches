'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Building2, Globe, Bell, ExternalLink, ArrowRight, MapPin, Calendar, FileText, Package, Loader2 } from 'lucide-react';
import { BuyerLocation } from '@/lib/buyers';
import { Tender } from '@/lib/types';
import Link from 'next/link';
import clsx from 'clsx';

// Interface pour les marchés (format affiché)
interface Marche {
    id: string;
    titre: string;
    acheteur: string;
    joursRestants: number;
    procedure: string;
    montant: string;
    type: string;
    lieu: string;
    dateLimite: string;
    url: string;
}

// Convertir un Tender API en Marche pour l'affichage
const tenderToMarche = (tender: Tender): Marche => {
    const daysLeft = Math.ceil((new Date(tender.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Déterminer le type de marché
    let type = 'Non précisé';
    if (tender.marketNature === 'fournitures') type = 'Fournitures';
    else if (tender.marketNature === 'services') type = 'Services';
    else if (tender.marketNature === 'travaux') type = 'Travaux';

    // Formater le montant
    let montant = 'Non précisé';
    if (tender.estimatedAmount && tender.estimatedAmount > 0) {
        if (tender.estimatedAmount >= 1000000) {
            montant = `${(tender.estimatedAmount / 1000000).toFixed(1)}M€`;
        } else if (tender.estimatedAmount >= 1000) {
            montant = `${Math.round(tender.estimatedAmount / 1000)}k€`;
        } else {
            montant = `${tender.estimatedAmount}€`;
        }
    } else if (tender.amountRange) {
        const ranges: Record<string, string> = {
            'small': '< 40k€',
            'medium': '40k€ - 90k€',
            'large': '90k€ - 221k€',
            'xlarge': '> 221k€'
        };
        montant = ranges[tender.amountRange] || 'Non précisé';
    }

    return {
        id: tender.id,
        titre: tender.title,
        acheteur: tender.buyer.name,
        joursRestants: Math.max(0, daysLeft),
        procedure: tender.procedureType || 'Non précisée',
        montant,
        type,
        lieu: tender.buyer.department || 'France',
        dateLimite: new Date(tender.deadlineDate).toLocaleDateString('fr-FR'),
        url: tender.boampUrl || `https://www.boamp.fr/pages/avis/?q=idweb:"${tender.id}"`
    };
};

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
    const [selectedMarche, setSelectedMarche] = useState<Marche | null>(null);
    const [allTenders, setAllTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);

    // Charger les marchés depuis l'API
    useEffect(() => {
        const fetchTenders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tenders');
                if (!response.ok) throw new Error(`Erreur ${response.status}`);
                const data = await response.json();
                setAllTenders(data.tenders || []);
            } catch (err) {
                console.error('Erreur chargement marchés:', err);
            } finally {
                setLoading(false);
            }
        };

        if (buyer) {
            fetchTenders();
        }
    }, [buyer]);

    // Normaliser un nom pour comparaison (minuscules, sans accents, sans ponctuation)
    const normalizeString = (str: string): string => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
            .replace(/[^a-z0-9\s]/g, ' ')    // Remplace ponctuation par espaces
            .replace(/\s+/g, ' ')            // Normalise les espaces
            .trim();
    };

    // Filtrer les marchés pour cet acheteur spécifique - correspondance exacte uniquement
    const marches = useMemo(() => {
        if (!buyer || allTenders.length === 0) return [];

        const buyerNameNormalized = normalizeString(buyer.nom);

        // Correspondance exacte : le nom normalisé de l'acheteur BOAMP doit contenir
        // le nom normalisé complet de l'acheteur sélectionné (ou vice-versa)
        const filtered = allTenders.filter(tender => {
            const tenderBuyerNormalized = normalizeString(tender.buyer.name);
            // Match si l'un contient l'autre en entier
            return tenderBuyerNormalized.includes(buyerNameNormalized) ||
                   buyerNameNormalized.includes(tenderBuyerNormalized);
        });

        // Convertir en format Marche et ne garder que ceux avec joursRestants > 0
        return filtered
            .map(tenderToMarche)
            .filter(m => m.joursRestants > 0)
            .slice(0, 5); // Limiter à 5 marchés dans le panel
    }, [allTenders, buyer]);

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

                {/* Active Tenders */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Marchés en cours {!loading && `(${marches.length})`}
                    </h3>
                    <div className="space-y-3">
                        {loading ? (
                            // Skeleton loading
                            [...Array(2)].map((_, i) => (
                                <div key={i} className="bg-[#14181F] p-4 rounded-xl border border-white/5 animate-pulse">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="h-5 w-12 bg-slate-700 rounded"></div>
                                        <div className="h-4 w-24 bg-slate-700 rounded"></div>
                                    </div>
                                    <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
                                    <div className="h-3 w-20 bg-slate-700 rounded"></div>
                                </div>
                            ))
                        ) : marches.length === 0 ? (
                            <div className="bg-[#14181F] p-4 rounded-xl border border-white/5 text-center">
                                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">Aucun marché actif</p>
                                <p className="text-xs text-slate-500 mt-1">Pas de marché en cours pour cet acheteur</p>
                            </div>
                        ) : (
                            marches.map((marche) => (
                                <div
                                    key={marche.id}
                                    onClick={() => setSelectedMarche(marche)}
                                    className="bg-[#14181F] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            marche.joursRestants <= 7
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-slate-700 text-gray-400'
                                        }`}>
                                            J-{marche.joursRestants}
                                        </span>
                                        <span className="text-[10px] text-slate-500">{marche.procedure}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                                        {marche.titre}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">{marche.montant}</span>
                                        <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Voir →</span>
                                    </div>
                                </div>
                            ))
                        )}
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

            {/* Modal détail marché */}
            {selectedMarche && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setSelectedMarche(null)}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
                                selectedMarche.joursRestants <= 7
                                    ? 'bg-red-500/20 text-red-400'
                                    : selectedMarche.joursRestants <= 14
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'bg-blue-500/20 text-blue-400'
                            }`}>
                                J-{selectedMarche.joursRestants}
                            </span>
                            <button
                                onClick={() => setSelectedMarche(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Titre */}
                        <h2 className="text-xl font-bold text-white mb-3 leading-tight">
                            {selectedMarche.titre}
                        </h2>

                        {/* Acheteur */}
                        <p className="text-base text-blue-400 mb-6">{selectedMarche.acheteur}</p>

                        {/* Infos */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Lieu d&apos;exécution</p>
                                    <p className="text-sm text-white">{selectedMarche.lieu || 'France'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Date limite de réponse</p>
                                    <p className="text-sm text-white">{selectedMarche.dateLimite || 'Non précisée'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Procédure</p>
                                    <p className="text-sm text-white">{selectedMarche.procedure || 'Non précisée'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Type de marché</p>
                                    <p className="text-sm text-white">{selectedMarche.type || 'Non précisé'}</p>
                                </div>
                            </div>

                            {selectedMarche.montant && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">€</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Montant estimé</p>
                                        <p className="text-sm text-white">{selectedMarche.montant}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Séparateur */}
                        <div className="border-t border-slate-800 my-6"></div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Link
                                href={`/repondre?marcheId=${selectedMarche.id}&acheteur=${encodeURIComponent(selectedMarche.acheteur)}&objet=${encodeURIComponent(selectedMarche.titre)}`}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <FileText className="w-5 h-5" />
                                Répondre à l&apos;appel d&apos;offres
                            </Link>

                            <a
                                href={selectedMarche.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 bg-slate-800 text-gray-300 rounded-xl font-medium text-center flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Voir sur BOAMP
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
