'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, FileText, Calendar, ExternalLink, Loader2, Clock, Shield, ShieldCheck } from 'lucide-react';

interface MarcheBoamp {
    id: string;
    titre: string;
    acheteur: string;
    dateLimite: string;
    datePublication: string;
    type: string;
    procedure: string;
    url: string | null;
    joursRestants: number;
}

interface AcheteurDetail {
    id: string;
    code: string;
    nom: string;
    tutelle: string;
    ministere: 'defense' | 'interieur';
    stats: {
        actifs: number;
        urgent: number;
        moyen: number;
    };
    marches: MarcheBoamp[];
    error?: string;
}

export default function AcheteurDetailPage() {
    const { id } = useParams();
    const [acheteur, setAcheteur] = useState<AcheteurDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`/api/acheteurs/${id}`)
                .then(res => res.json())
                .then(setAcheteur)
                .finally(() => setLoading(false));
        }
    }, [id]);

    const isDefense = acheteur?.ministere === 'defense';
    const accentColor = isDefense ? 'blue' : 'blue';

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!acheteur || acheteur.error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <p className="text-amber-400 mb-4">Acheteur non trouvé</p>
                <Link href="/acheteurs" className="text-blue-400 hover:underline">
                    Retour à l&apos;annuaire
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-8">
            <div className="max-w-4xl mx-auto px-6">

                {/* Retour */}
                <Link href="/acheteurs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à l&apos;annuaire
                </Link>

                {/* Header */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDefense ? 'bg-blue-500/10' : 'bg-blue-500/10'
                            }`}>
                            <Building2 className={`w-7 h-7 ${isDefense ? 'text-blue-400' : 'text-blue-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {/* Badge ministère */}
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${isDefense
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {isDefense ? <Shield className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                    {isDefense ? 'Défense' : 'Intérieur'}
                                </span>
                                {/* Badge tutelle */}
                                <span className="inline-block text-xs bg-slate-700 text-gray-400 px-2 py-1 rounded-full">
                                    {acheteur.tutelle}
                                </span>
                            </div>
                            <p className={`font-mono text-sm ${isDefense ? 'text-blue-400' : 'text-blue-400'}`}>{acheteur.code}</p>
                            <h1 className="text-2xl font-bold text-white mt-1">{acheteur.nom}</h1>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-white">{acheteur.stats?.actifs || 0}</p>
                            <p className="text-sm text-gray-500">Marchés actifs</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-amber-400">{acheteur.stats?.urgent || 0}</p>
                            <p className="text-sm text-gray-500">&lt; 7 jours</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className={`text-3xl font-bold ${isDefense ? 'text-blue-400' : 'text-blue-400'}`}>{acheteur.stats?.moyen || 0}</p>
                            <p className="text-sm text-gray-500">7-30 jours</p>
                        </div>
                    </div>
                </div>

                {/* Liste des marchés */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Marchés en cours ({acheteur.marches?.length || 0})
                    </h2>

                    {(!acheteur.marches || acheteur.marches.length === 0) ? (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                            <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">Aucun marché en cours pour cet acheteur.</p>
                            <p className="text-gray-500 text-sm mt-1">Les nouveaux marchés apparaîtront automatiquement.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {acheteur.marches.map((marche) => (
                                <div
                                    key={marche.id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${marche.joursRestants <= 7
                                            ? 'bg-red-500/20 text-amber-400'
                                            : marche.joursRestants <= 14
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-slate-700 text-gray-400'
                                            }`}>
                                            J-{marche.joursRestants}
                                        </span>
                                        {marche.url && (
                                            <a
                                                href={marche.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                                title="Voir sur BOAMP"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>

                                    <h3 className="text-white font-medium mb-3 leading-relaxed">{marche.titre}</h3>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {marche.dateLimite
                                                ? new Date(marche.dateLimite).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : 'Date non précisée'
                                            }
                                        </span>
                                        <span className="bg-slate-700/50 px-2 py-0.5 rounded">{marche.procedure}</span>
                                        <span className="bg-slate-700/50 px-2 py-0.5 rounded">{marche.type}</span>
                                    </div>

                                    {/* Bouton répondre */}
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <Link
                                            href={`/repondre?marcheId=${marche.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Répondre à l'appel d'offres
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
