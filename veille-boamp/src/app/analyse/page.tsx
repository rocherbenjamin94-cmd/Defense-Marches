'use client';

import { Sparkles, BarChart3 } from 'lucide-react';

export default function AnalysePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 pt-28">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Outils d'<span className="text-blue-600 dark:text-blue-400">analyse</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Maximisez vos chances de remporter des marchés avec nos outils d'analyse IA.
                    </p>
                </div>

                {/* Grille des outils */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">

                    {/* Score de compatibilité IA */}
                    <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Score de compatibilité IA</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Notre IA analyse chaque appel d'offres et calcule votre score de compatibilité en 30 secondes.
                        </p>
                        <p className="text-xs text-gray-500 mb-6">
                            Basé sur : secteur d'activité, certifications, historique de réponses
                        </p>

                        {/* Exemples de scores */}
                        <div className="space-y-3 mb-6">
                            <div className="bg-gray-100 dark:bg-slate-900/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Maintenance systèmes radar THALES</span>
                                    <span className="text-green-600 dark:text-green-400 font-bold">94%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" style={{ width: '94%' }}></div>
                                </div>
                            </div>

                            <div className="bg-gray-100 dark:bg-slate-900/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Fourniture uniformes Gendarmerie</span>
                                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">67%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-yellow-500 rounded-full" style={{ width: '67%' }}></div>
                                </div>
                            </div>

                            <div className="bg-gray-100 dark:bg-slate-900/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Construction base défense Brest</span>
                                    <span className="text-orange-600 dark:text-orange-400 font-bold">42%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full" style={{ width: '42%' }}></div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                            Créer mon profil entreprise
                        </button>
                        <p className="text-sm text-gray-500 text-center mt-3 flex items-center justify-center gap-2">
                            <span>✓ Gratuit</span>
                            <span>•</span>
                            <span>⚡ 2 minutes</span>
                            <span>•</span>
                            <span>🔒 Sans CB</span>
                        </p>
                    </div>

                    {/* Statistiques */}
                    <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-green-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Statistiques marchés</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Vue d'ensemble du secteur défense</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">594</p>
                                <p className="text-gray-500 text-sm">Marchés ouverts</p>
                            </div>
                            <div className="text-center p-4 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">2.4M€</p>
                                <p className="text-gray-500 text-sm">Valeur moyenne</p>
                            </div>
                            <div className="text-center p-4 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">45%</p>
                                <p className="text-gray-500 text-sm">Fournitures</p>
                            </div>
                            <div className="text-center p-4 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                                <p className="text-gray-500 text-sm">Clôturent cette semaine</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
