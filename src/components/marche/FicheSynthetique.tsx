'use client';

import { AnalyseMarche, ScoreCompatibilite } from '@/services/analyseService';
import { Building2, Calendar, FileText, Target, Lock, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Props {
    analyse: AnalyseMarche;
    queryString: string;
    profilComplete: boolean;
    onCompleterProfil: () => void;
}

export function FicheSynthetique({ analyse, queryString, profilComplete, onCompleterProfil }: Props) {
    const score = analyse.scoreCompatibilite;

    const getScoreColor = (scoreValue: number) => {
        if (scoreValue >= 70) return { text: 'text-green-400', bg: 'bg-green-400' };
        if (scoreValue >= 40) return { text: 'text-orange-400', bg: 'bg-orange-400' };
        return { text: 'text-red-400', bg: 'bg-red-400' };
    };

    const getNiveauBadge = (niveau: string) => {
        const colors: Record<string, string> = {
            'Facile': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Moyen': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'Difficile': 'bg-red-500/20 text-red-400 border-red-500/30',
            'Élevé': 'bg-green-500/20 text-green-400 border-green-500/30',
        };
        return colors[niveau] || colors['Moyen'];
    };

    const scoreColor = getScoreColor(score?.scoreGenerique || 50);

    return (
        <div className="space-y-6 mb-8">

            {/* Score de compatibilité */}
            {score && (
                <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Score de compatibilité
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getNiveauBadge(score.niveau)}`}>
                            {score.niveau}
                        </span>
                    </div>

                    {/* Jauge de score */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-3xl font-bold ${scoreColor.text}`}>
                                {score.scoreGenerique}%
                            </span>
                            <span className="text-sm text-slate-400">Score générique</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${scoreColor.bg}`}
                                style={{ width: `${score.scoreGenerique}%` }}
                            />
                        </div>
                    </div>

                    {/* Points clés génériques */}
                    {score.pointsCles && score.pointsCles.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {score.pointsCles.map((point, i) => (
                                <p key={i} className="text-sm text-slate-400">{point}</p>
                            ))}
                        </div>
                    )}

                    {/* Résumé */}
                    {score.resumeGenerique && (
                        <p className="text-sm text-slate-300 bg-white/5 rounded-lg p-3 mb-4">
                            {score.resumeGenerique}
                        </p>
                    )}

                    {/* Teasing score personnalisé */}
                    {!profilComplete && !score.scorePersonnaliseDisponible && (
                        <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white mb-1">
                                        Débloquez votre score PERSONNALISÉ
                                    </h4>
                                    <p className="text-sm text-slate-400 mb-3">
                                        Complétez votre profil entreprise pour savoir si ce marché correspond vraiment à vos capacités.
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-1 mb-4">
                                        <li>• Comparaison avec vos certifications</li>
                                        <li>• Analyse de votre CA vs exigences</li>
                                        <li>• Conseils personnalisés pour votre candidature</li>
                                    </ul>
                                    <button
                                        onClick={onCompleterProfil}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg text-sm font-medium transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Compléter mon profil (2 min)
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Score personnalisé (si profil complété) */}
                    {score.scorePersonnaliseDisponible && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-green-400">
                                    ✨ Analyse personnalisée pour votre entreprise
                                </h4>
                                {score.scorePersonnalise && (
                                    <span className="text-2xl font-bold text-green-400">
                                        {score.scorePersonnalise}%
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {score.pointsForts?.map((point, i) => (
                                    <p key={i} className="text-sm text-green-300">✅ {point}</p>
                                ))}
                                {score.pointsVigilance?.map((point, i) => (
                                    <p key={i} className="text-sm text-orange-300">⚠️ {point}</p>
                                ))}
                            </div>
                            {score.recommandation && (
                                <p className="mt-3 text-sm text-slate-300 italic bg-white/5 rounded-lg p-3">
                                    💡 {score.recommandation}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Infos marché */}
            <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white">{analyse.marche.titre}</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">{analyse.marche.objet}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <span className="text-slate-500">Réf: {analyse.marche.reference}</span>
                    {analyse.marche.dateLimite && (
                        <span className="flex items-center gap-1 text-orange-400">
                            <Calendar className="w-4 h-4" />
                            Limite: {new Date(analyse.marche.dateLimite).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                    {analyse.marche.montantEstime && (
                        <span className="text-green-400 font-medium">
                            Montant: {analyse.marche.montantEstime}
                        </span>
                    )}
                </div>
            </div>

            {/* Acheteur */}
            <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-slate-400" /> Acheteur
                </h3>
                <div className="text-sm text-slate-400 space-y-1 bg-white/5 rounded-lg p-4">
                    <p className="font-medium text-white">{analyse.acheteur.nom}</p>
                    <p>{analyse.acheteur.adresse}</p>
                    {analyse.acheteur.contact !== 'Non précisé' && (
                        <p>Contact: {analyse.acheteur.contact}</p>
                    )}
                    <div className="flex flex-wrap gap-4 pt-1">
                        {analyse.acheteur.email !== 'Non précisé' && (
                            <p>📧 {analyse.acheteur.email}</p>
                        )}
                        {analyse.acheteur.telephone !== 'Non précisé' && (
                            <p>📞 {analyse.acheteur.telephone}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Lots */}
            {analyse.lots && analyse.lots.length > 0 && (
                <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white mb-3">📦 Lots ({analyse.lots.length})</h3>
                    <ul className="space-y-2">
                        {analyse.lots.map((lot) => (
                            <li key={lot.numero} className="text-sm text-slate-400 bg-white/5 rounded-lg p-3">
                                <span className="font-medium text-blue-400">Lot {lot.numero}:</span> {lot.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Documents requis */}
            {analyse.documentsRequis && analyse.documentsRequis.length > 0 && (
                <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-slate-400" /> Documents requis
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {analyse.documentsRequis.map((doc) => (
                            <span
                                key={doc}
                                className={`px-3 py-1.5 rounded-lg text-sm ${doc.includes('DC1') || doc.includes('DC2')
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-white/5 border border-white/10 text-slate-300'
                                    }`}
                            >
                                {doc}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Critères de sélection */}
            {analyse.criteresSelection && analyse.criteresSelection.length > 0 && (
                <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white mb-3">⚖️ Critères de sélection</h3>
                    <div className="space-y-3">
                        {analyse.criteresSelection.map((critere) => (
                            <div key={critere.critere} className="flex items-center justify-between">
                                <span className="text-slate-400">{critere.critere}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: critere.ponderation }}
                                        />
                                    </div>
                                    <span className="font-medium text-white w-12 text-right">
                                        {critere.ponderation}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
