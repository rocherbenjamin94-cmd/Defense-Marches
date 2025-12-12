'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, FileCheck, PenTool, Package, Lock, Info, Building2, Calendar, FileSignature, Loader2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { analyserMarche, AnalyseMarche, getProfil } from '@/services/analyseService';
import { FicheSynthetique } from '@/components/marche/FicheSynthetique';

function RepondreContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { userId, isLoaded } = useAuth();

    // Read tender info from URL params
    const marcheId = searchParams.get('marcheId');
    const boampUrl = searchParams.get('boampUrl');
    const acheteur = searchParams.get('acheteur');
    const objet = searchParams.get('objet');
    const dateLimite = searchParams.get('dateLimite');

    const hasTenderInfo = marcheId || boampUrl;

    // Analysis state
    const [analyse, setAnalyse] = useState<AnalyseMarche | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profilComplete, setProfilComplete] = useState(false);

    // Build query string to pass to sub-pages
    const queryString = marcheId
        ? `?marcheId=${marcheId}${acheteur ? `&acheteur=${encodeURIComponent(acheteur)}` : ''}${objet ? `&objet=${encodeURIComponent(objet)}` : ''}${dateLimite ? `&dateLimite=${dateLimite}` : ''}`
        : '';

    // Check if user has completed profile
    useEffect(() => {
        if (isLoaded && userId) {
            getProfil(userId)
                .then((result) => {
                    if (result.exists && result.data) {
                        // Consider profile complete if at least SIRET and one domain is set
                        const p = result.data;
                        setProfilComplete(Boolean(p.siret && p.domainesActivite?.length > 0));
                    }
                })
                .catch(console.error);
        }
    }, [userId, isLoaded]);

    // Fetch analysis when marcheId is present
    useEffect(() => {
        if (marcheId) {
            const url = boampUrl || `https://www.boamp.fr/avis/detail/${marcheId}`;
            setLoading(true);
            setError(null);

            analyserMarche(marcheId, url)
                .then((result) => {
                    setAnalyse(result);
                })
                .catch((err) => {
                    console.error('Erreur analyse:', err);
                    setError(err.message || 'Erreur lors de l\'analyse');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [marcheId, boampUrl]);

    const handleCompleterProfil = () => {
        router.push('/profil');
    };

    return (
        <div className="min-h-screen bg-[#0B0D11] text-white pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4 text-white">RÉPONDRE À UN APPEL D'OFFRES</h1>
                    <p className="text-slate-400 text-lg">
                        {hasTenderInfo ? 'Analyse IA du marché et génération de documents' : 'Générez vos documents de candidature'}
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mb-8 p-8 bg-[#14181F] border border-white/10 rounded-xl flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-slate-300 font-medium">Analyse en cours...</p>
                        <p className="text-slate-500 text-sm mt-1">Claude AI analyse l'avis de marché BOAMP</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-300">Erreur d'analyse</h3>
                                <p className="text-red-200 text-sm mt-1">{error}</p>
                                <p className="text-slate-400 text-xs mt-2">Vous pouvez toujours générer les documents manuellement ci-dessous.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis Result - FicheSynthetique */}
                {analyse && !loading && (
                    <FicheSynthetique
                        analyse={analyse}
                        queryString={queryString}
                        profilComplete={profilComplete}
                        onCompleterProfil={handleCompleterProfil}
                    />
                )}

                {/* Fallback Tender Info Banner - Only shown if no analysis and has tender info */}
                {hasTenderInfo && !analyse && !loading && (
                    <div className="mb-8 p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-3">
                            <FileSignature className="w-4 h-4" />
                            Marché sélectionné
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-3 line-clamp-2">{objet}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                {acheteur}
                            </div>
                            {dateLimite && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    Date limite: {new Date(dateLimite).toLocaleDateString('fr-FR')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section explicative attractive */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 mb-8">
                    {/* Effet de glow en arrière-plan */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        {/* Header avec icône animée */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Générez vos documents en 30 secondes
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Notre IA remplit automatiquement les formulaires officiels
                                </p>
                            </div>
                        </div>

                        {/* Étapes visuelles - cliquables */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            {/* Étape 1 - DC1 */}
                            <Link href={`/repondre/dc1${queryString}`} className="bg-slate-700/50 backdrop-blur rounded-xl p-4 border border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/70 transition-all group cursor-pointer">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/25">
                                        1
                                    </span>
                                    <span className="text-white font-semibold group-hover:text-blue-400 transition-colors">DC1</span>
                                    <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Obligatoire</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-3">
                                    Lettre de candidature — Identifie votre entreprise auprès de l'acheteur
                                </p>
                                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    Générer →
                                </div>
                            </Link>

                            {/* Étape 2 - DC2 */}
                            <Link href={`/repondre/dc2${queryString}`} className="bg-slate-700/50 backdrop-blur rounded-xl p-4 border border-slate-600/50 hover:border-green-500/50 hover:bg-slate-700/70 transition-all group cursor-pointer">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-green-500/25">
                                        2
                                    </span>
                                    <span className="text-white font-semibold group-hover:text-green-400 transition-colors">DC2</span>
                                    <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Obligatoire</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-3">
                                    Déclaration du candidat — Prouve vos capacités et références
                                </p>
                                <div className="flex items-center text-green-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    Générer →
                                </div>
                            </Link>

                            {/* Étape 3 - Mémoire (disabled) */}
                            <div className="bg-slate-700/50 backdrop-blur rounded-xl p-4 border border-slate-600/50 transition-all opacity-60 cursor-not-allowed">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-purple-500/25">
                                        3
                                    </span>
                                    <span className="text-white font-semibold">Mémoire</span>
                                    <span className="ml-auto text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Premium
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-3">
                                    Mémoire technique — Réponse détaillée au cahier des charges
                                </p>
                                <div className="flex items-center text-gray-500 text-sm font-medium">
                                    Bientôt disponible 🔒
                                </div>
                            </div>
                        </div>

                        {/* Call to action */}
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">✓</div>
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">✓</div>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Prêt à candidater ?</p>
                                    <p className="text-gray-500 text-xs">Commencez par le DC1, c'est gratuit</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-cyan-400 text-sm">
                                <Zap className="w-4 h-4" />
                                <span>5 générations gratuites</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!hasTenderInfo && (
                    <div className="glass-panel rounded-lg p-4 flex items-start gap-3 border border-white/10">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">
                            <span className="font-semibold text-white">Astuce :</span> Trouvez un marché sur la page{' '}
                            <Link href="/" className="text-blue-500 hover:underline">
                                Marchés
                            </Link>{' '}
                            et cliquez sur "Répondre" pour pré-remplir automatiquement les informations du formulaire.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RepondrePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0B0D11] flex items-center justify-center text-slate-500">Chargement...</div>}>
            <RepondreContent />
        </Suspense>
    );
}

