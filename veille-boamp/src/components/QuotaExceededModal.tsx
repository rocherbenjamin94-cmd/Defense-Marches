'use client';

import { X, Sparkles, Zap, Check } from 'lucide-react';

interface QuotaExceededModalProps {
    isOpen: boolean;
    onClose: () => void;
    used: number;
    limit: number;
}

export function QuotaExceededModal({ isOpen, onClose, used, limit }: QuotaExceededModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-900 border border-orange-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                        <Zap className="w-8 h-8 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Quota atteint</h2>
                    <p className="text-slate-400">
                        Vous avez utilisé vos <span className="text-orange-400 font-semibold">{used}/{limit}</span> générations gratuites ce mois-ci.
                    </p>
                </div>

                {/* Pro Benefits */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        Passez Pro pour débloquer
                    </h3>
                    <ul className="space-y-2 text-sm">
                        {[
                            "Générations illimitées DC1 & DC2",
                            "Analyses IA approfondies",
                            "Export multi-formats (PDF, Word, Excel)",
                            "Historique complet des réponses",
                            "Support prioritaire"
                        ].map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300">
                                <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/25">
                        Passer Pro — 29€/mois
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                        Revenir plus tard
                    </button>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    Le quota se renouvelle chaque mois • Sans engagement
                </p>
            </div>
        </div>
    );
}
