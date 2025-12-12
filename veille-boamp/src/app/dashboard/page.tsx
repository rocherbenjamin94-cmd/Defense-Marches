'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Zap, ArrowLeft, Star, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useFavorites, FavoriteTender } from '@/hooks/useFavorites';

interface GeneratedDocument {
    id: string;
    user_id: string;
    marche_id: string;
    marche_titre: string;
    marche_acheteur: string;
    document_type: 'dc1' | 'dc2';
    file_name: string;
    file_format: 'pdf' | 'docx';
    generated_at: string;
}

interface QuotaStatus {
    used: number;
    limit: number;
    canGenerate: boolean;
    resetDate: string;
}

interface GroupedMarche {
    marche_id: string;
    marche_titre: string;
    marche_acheteur: string;
    documents: GeneratedDocument[];
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const { favorites, removeFavorite, isLoaded: favoritesLoaded } = useFavorites();
    const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
    const [quota, setQuota] = useState<QuotaStatus>({ used: 0, limit: 5, canGenerate: true, resetDate: '' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'documents' | 'favoris'>('documents');

    useEffect(() => {
        if (isLoaded && user) {
            fetchData();
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    const fetchData = async () => {
        try {
            const [historyRes, quotaRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/history`, {
                    headers: { 'x-user-id': user!.id }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/quota`, {
                    headers: { 'x-user-id': user!.id }
                })
            ]);

            if (historyRes.ok) {
                setDocuments(await historyRes.json());
            }
            if (quotaRes.ok) {
                setQuota(await quotaRes.json());
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    // Grouper par marché
    const groupedByMarche = documents.reduce<Record<string, GroupedMarche>>((acc, doc) => {
        if (!acc[doc.marche_id]) {
            acc[doc.marche_id] = {
                marche_id: doc.marche_id,
                marche_titre: doc.marche_titre,
                marche_acheteur: doc.marche_acheteur,
                documents: []
            };
        }
        acc[doc.marche_id].documents.push(doc);
        return acc;
    }, {});

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-gray-500">Chargement...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Connexion requise</h2>
                    <p className="text-gray-500 mb-6">Connectez-vous pour accéder à vos documents</p>
                    <Link href="/sign-in" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium">
                        Se connecter
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-6">

                {/* Back link */}
                <Link href="/marches" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux marchés
                </Link>

                {/* Header + Quota */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon espace</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Documents générés et marchés favoris</p>
                    </div>

                    {/* Compteur quota */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Générations ce mois</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {quota.used} <span className="text-lg font-normal text-gray-500">/ {quota.limit}</span>
                            </p>
                        </div>
                        {!quota.canGenerate && (
                            <button className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
                                Passer Pro
                            </button>
                        )}
                    </div>
                </div>

                {/* Onglets */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === 'documents'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Mes documents
                    </button>
                    <button
                        onClick={() => setActiveTab('favoris')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === 'favoris'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Star className="w-4 h-4" />
                        Favoris {favorites.length > 0 && `(${favorites.length})`}
                    </button>
                </div>

                {/* Contenu - Onglet Documents */}
                {activeTab === 'documents' && (
                    <>
                        {Object.keys(groupedByMarche).length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun document généré</h3>
                                <p className="text-gray-500 mb-6">Commencez par répondre à un appel d'offres</p>
                                <Link href="/marches" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium inline-block hover:opacity-90 transition-opacity">
                                    Explorer les marchés
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.values(groupedByMarche).map((groupe) => (
                                    <div key={groupe.marche_id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">

                                        {/* Header marché */}
                                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{groupe.marche_titre || 'Marché sans titre'}</h3>
                                                    <p className="text-sm text-gray-500 truncate">{groupe.marche_acheteur || 'Acheteur inconnu'}</p>
                                                </div>
                                                <Link
                                                    href={`/repondre?marcheId=${groupe.marche_id}`}
                                                    className="text-blue-500 text-sm hover:underline flex items-center gap-1 ml-4 whitespace-nowrap"
                                                >
                                                    Voir <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div className="divide-y divide-gray-200 dark:divide-slate-700">
                                            {groupe.documents.map((doc) => (
                                                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.document_type === 'dc1' ? 'bg-blue-500/10' : 'bg-green-500/10'
                                                            }`}>
                                                            <FileText className={`w-5 h-5 ${doc.document_type === 'dc1' ? 'text-blue-500' : 'text-green-500'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {doc.document_type.toUpperCase()}
                                                                <span className="ml-2 text-xs text-gray-500 font-normal">.{doc.file_format}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(doc.generated_at).toLocaleDateString('fr-FR', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                        title="Télécharger (bientôt disponible)"
                                                    >
                                                        <Download className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Contenu - Onglet Favoris */}
                {activeTab === 'favoris' && (
                    <>
                        {favorites.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                                <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun favori</h3>
                                <p className="text-gray-500 mb-6">Ajoutez des marchés à vos favoris pour les retrouver facilement</p>
                                <Link href="/marches" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium inline-block hover:opacity-90 transition-opacity">
                                    Explorer les marchés
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {favorites.map((fav) => {
                                    const daysLeft = Math.ceil((new Date(fav.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                    const isExpired = daysLeft < 0;
                                    const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                                    return (
                                        <div key={fav.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{fav.title}</h3>
                                                    <p className="text-sm text-gray-500 truncate">{fav.buyerName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 ml-4">
                                                {/* Badge délai */}
                                                <div className={`text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                                                    isExpired
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                        : isUrgent
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                    <Clock className="w-3 h-3" />
                                                    {isExpired ? 'Expiré' : `J-${daysLeft}`}
                                                </div>

                                                {/* Actions */}
                                                <Link
                                                    href={`/repondre?marcheId=${fav.id}&acheteur=${encodeURIComponent(fav.buyerName)}&objet=${encodeURIComponent(fav.title)}&dateLimite=${fav.deadlineDate}`}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    Répondre
                                                </Link>
                                                <button
                                                    onClick={() => removeFavorite(fav.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Retirer des favoris"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
