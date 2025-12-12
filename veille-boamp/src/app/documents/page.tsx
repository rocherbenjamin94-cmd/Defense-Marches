'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, FileCheck, BookOpen, ClipboardList, CheckSquare, Award, Key } from 'lucide-react';
import { DocumentDropzone } from '@/components/dc1/document-analysis/DocumentDropzone';
import { useDocumentAnalysis } from '@/hooks/dc1/useDocumentAnalysis';
import DocumentTypeCard from '@/components/documents/DocumentTypeCard';

// Clé localStorage pour stocker les données extraites
const EXTRACTED_DATA_KEY = 'documents_extracted_data';

export default function DocumentsPage() {
    const router = useRouter();
    const [fileUploaded, setFileUploaded] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const {
        analyze,
        data: extractedData,
        isAnalyzing,
        error: analysisError,
        reset: resetAnalysis,
    } = useDocumentAnalysis();

    const handleFileAccepted = async (file: File) => {
        setFileName(file.name);
        setFileUploaded(true);
        await analyze(file);
    };

    const handleNavigateToForm = (formType: 'dc1' | 'dc2') => {
        // Stocker les données extraites en localStorage pour le formulaire
        if (extractedData) {
            localStorage.setItem(EXTRACTED_DATA_KEY, JSON.stringify(extractedData));
        }

        // Construire les query params à partir des données extraites
        // Utilise les champs disponibles dans ExtractedDocumentData
        const params = new URLSearchParams();
        if (extractedData?.acheteur?.nom) {
            params.set('acheteur', extractedData.acheteur.nom);
        }
        if (extractedData?.consultation?.objet) {
            params.set('objet', extractedData.consultation.objet);
        }
        if (extractedData?.acheteur?.reference_avis) {
            params.set('marcheId', extractedData.acheteur.reference_avis);
        }
        if (extractedData?.informations?.date_limite_reponse) {
            params.set('dateLimite', extractedData.informations.date_limite_reponse);
        }

        const queryString = params.toString();
        router.push(`/repondre/${formType}${queryString ? `?${queryString}` : ''}`);
    };

    const handleReset = () => {
        setFileUploaded(false);
        setFileName(null);
        resetAnalysis();
        localStorage.removeItem(EXTRACTED_DATA_KEY);
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Générez vos documents
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Importez votre DCE/RC et générez automatiquement vos documents de réponse
                    </p>
                </div>

                {/* Dropzone */}
                <div className="mb-12">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                        {!fileUploaded ? (
                            <DocumentDropzone
                                onFileAccepted={handleFileAccepted}
                                isDisabled={isAnalyzing}
                            />
                        ) : (
                            <div className="text-center py-6">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <FileCheck className="w-8 h-8 text-green-400" />
                                    <span className="text-white font-medium">{fileName}</span>
                                </div>
                                {isAnalyzing ? (
                                    <div className="flex items-center justify-center gap-2 text-blue-400">
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                        <span>Analyse en cours...</span>
                                    </div>
                                ) : extractedData ? (
                                    <div className="space-y-3">
                                        <p className="text-green-400">Document analysé avec succès</p>
                                        {extractedData.consultation?.objet && (
                                            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                                                {extractedData.consultation.objet}
                                            </p>
                                        )}
                                        <button
                                            onClick={handleReset}
                                            className="text-sm text-slate-500 hover:text-slate-300 underline mt-2"
                                        >
                                            Importer un autre document
                                        </button>
                                    </div>
                                ) : analysisError ? (
                                    <div className="space-y-2">
                                        <p className="text-red-400">Erreur lors de l'analyse</p>
                                        <button
                                            onClick={handleReset}
                                            className="text-sm text-slate-500 hover:text-slate-300 underline"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                {/* Document Types */}
                <div className="space-y-8">
                    {/* Section: Documents disponibles */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Choisissez le document à générer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DocumentTypeCard
                                title="DC1"
                                description="Lettre de candidature et habilitation du mandataire"
                                icon={FileText}
                                status="available"
                                onClick={() => handleNavigateToForm('dc1')}
                                disabled={isAnalyzing}
                            />
                            <DocumentTypeCard
                                title="DC2"
                                description="Déclaration du candidat individuel ou membre du groupement"
                                icon={FileText}
                                status="available"
                                onClick={() => handleNavigateToForm('dc2')}
                                disabled={isAnalyzing}
                            />
                            <DocumentTypeCard
                                title="Mémoire technique"
                                description="Réponse technique structurée et personnalisée"
                                icon={BookOpen}
                                status="premium"
                            />
                        </div>
                    </div>

                    {/* Section: Prochainement */}
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px flex-1 bg-slate-800" />
                            <span className="text-slate-500 text-sm font-medium">Prochainement</span>
                            <div className="h-px flex-1 bg-slate-800" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <DocumentTypeCard
                                title="Fiche synthétique"
                                description="Résumé des informations clés du marché"
                                icon={ClipboardList}
                                status="future"
                            />
                            <DocumentTypeCard
                                title="Checklist pièces"
                                description="Liste des documents demandés"
                                icon={CheckSquare}
                                status="future"
                            />
                            <DocumentTypeCard
                                title="Attestation sur l'honneur"
                                description="Document standard de déclaration"
                                icon={Award}
                                status="future"
                            />
                            <DocumentTypeCard
                                title="Délégation de pouvoir"
                                description="Pour les représentants autorisés"
                                icon={Key}
                                status="future"
                            />
                        </div>
                    </div>
                </div>

                {/* Info box */}
                <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-1">Comment ça marche ?</h3>
                            <p className="text-slate-400 text-sm">
                                Importez votre Dossier de Consultation des Entreprises (DCE) ou Règlement de Consultation (RC)
                                au format PDF ou Word. Notre IA analyse le document et pré-remplit automatiquement
                                les formulaires DC1 et DC2 avec les informations extraites.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
