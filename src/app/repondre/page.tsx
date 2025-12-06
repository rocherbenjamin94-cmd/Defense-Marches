'use client';

import Link from 'next/link';
import { FileText, FileCheck, PenTool, Package, Lock, Info } from 'lucide-react';

export default function RepondrePage() {
    return (
        <div className="min-h-screen bg-[#0B0D11] text-white pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4 text-white">RÉPONDRE À UN APPEL D'OFFRES</h1>
                    <p className="text-slate-400 text-lg">
                        Générez vos documents de candidature
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* DC1 Card */}
                    <Link href="/repondre/dc1">
                        <div className="bg-[#14181F] border border-white/5 rounded-xl p-6 
                          hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10
                          transition-all duration-200 cursor-pointer h-full group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                    <FileText className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">📄 DC1</h3>
                            <p className="text-slate-400 mb-2">Lettre de candidature</p>
                            <p className="text-sm text-slate-500 mb-6">
                                Identification et habilitation du candidat
                            </p>
                            <div className="flex items-center text-blue-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                Générer →
                            </div>
                        </div>
                    </Link>

                    {/* DC2 Card */}
                    <Link href="/repondre/dc2">
                        <div className="bg-[#14181F] border border-white/5 rounded-xl p-6 
                          hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10
                          transition-all duration-200 cursor-pointer h-full group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                    <FileCheck className="w-8 h-8 text-green-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">📄 DC2</h3>
                            <p className="text-slate-400 mb-2">Déclaration du candidat</p>
                            <p className="text-sm text-slate-500 mb-6">
                                Capacités et références du candidat
                            </p>
                            <div className="flex items-center text-green-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                Générer →
                            </div>
                        </div>
                    </Link>

                    {/* Mémoire Technique Card (Disabled) */}
                    <div className="bg-[#14181F] border border-white/5 rounded-xl p-6 
                        opacity-50 cursor-not-allowed h-full relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <PenTool className="w-8 h-8 text-purple-500" />
                            </div>
                            <Lock className="w-5 h-5 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">📝 Mémoire technique</h3>
                        <p className="text-slate-400 mb-2">Réponse détaillée à l'AO assistée par IA</p>
                        <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-xs text-slate-400 border border-white/10">
                            Bientôt 🔒
                        </div>
                    </div>

                    {/* Pack Complet Card (Disabled) */}
                    <div className="bg-[#14181F] border border-white/5 rounded-xl p-6 
                        opacity-50 cursor-not-allowed h-full relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <Package className="w-8 h-8 text-orange-500" />
                            </div>
                            <Lock className="w-5 h-5 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">📦 Pack complet</h3>
                        <p className="text-slate-400 mb-2">DC1 + DC2 + Mémoire technique</p>
                        <p className="text-sm text-slate-500 mb-4">
                            Tout-en-un pour candidater
                        </p>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-xs text-slate-400 border border-white/10">
                            Bientôt 🔒
                        </div>
                    </div>
                </div>

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
            </div>
        </div>
    );
}
