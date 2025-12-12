'use client';

import { X, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { SignUp, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    marcheId: string;
    marcheTitre: string;
    boampUrl: string;
}

export function ModalInscription({ isOpen, onClose, marcheId, marcheTitre, boampUrl }: Props) {
    const router = useRouter();
    const { isSignedIn } = useAuth();

    if (!isOpen) return null;

    // Si déjà connecté, rediriger directement
    if (isSignedIn) {
        router.push(`/repondre?marcheId=${marcheId}&boampUrl=${encodeURIComponent(boampUrl)}`);
        return null;
    }

    const redirectUrl = `/repondre?marcheId=${marcheId}&boampUrl=${encodeURIComponent(boampUrl)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#14181F] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10 animate-in zoom-in-95 fade-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Répondez à cet appel d'offres
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm line-clamp-2">
                        {marcheTitre}
                    </p>
                </div>

                <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        Compte gratuit
                    </h3>
                    <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            5 analyses de marchés / mois
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            Génération DC1 / DC2 automatique
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            Fiche synthétique IA
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            Score de compatibilité
                        </li>
                    </ul>
                </div>

                <SignUp
                    routing="hash"
                    forceRedirectUrl={redirectUrl}
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "shadow-none p-0 bg-transparent",
                            formButtonPrimary: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600",
                            headerTitle: "text-white",
                            headerSubtitle: "text-slate-400",
                            socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
                            formFieldLabel: "text-slate-300",
                            formFieldInput: "bg-slate-800 border-slate-600 text-white",
                            footerActionLink: "text-blue-400 hover:text-blue-300",
                        }
                    }}
                />
            </div>
        </div>
    );
}
