import { useState } from 'react';
import { SectionA } from './SectionA';
import { SectionB } from './SectionB';
import { SectionC } from './SectionC';
import { SectionD } from './SectionD';
import { SectionE } from './SectionE';
import { SectionF } from './SectionF';
import { Button, Alert } from '../common';
import {
  DocumentDropzone,
  AnalysisProgress,
  ExtractedDataPreview,
} from '../document-analysis';
import { useFormData, useDocumentAnalysis } from '@/hooks/dc1';
import { generatePdf, downloadPdf, generateWord, downloadWord } from '@/services/dc1';
import { validateDC1Form } from '@/lib/dc1/utils/validation';
import type { ValidationError } from '@/lib/dc1/utils/validation';

interface DC1FormProps {
  onGoToDC2?: () => void;
}

export function DC1Form({ onGoToDC2 }: DC1FormProps) {
  const { formData, resetForm, applyExtractedData } = useFormData();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Document analysis
  const {
    analyze,
    data: extractedData,
    isAnalyzing,
    error: analysisError,
    reset: resetAnalysis,
  } = useDocumentAnalysis();

  const isGroupement = formData.candidat.mode === 'groupement';

  const handleFileAccepted = async (file: File) => {
    setSelectedFile(file);
    await analyze(file);
  };

  const handleApplyExtractedData = () => {
    if (extractedData) {
      applyExtractedData(extractedData);
      resetAnalysis();
      setSelectedFile(null);
    }
  };

  const handleCancelExtraction = () => {
    resetAnalysis();
    setSelectedFile(null);
  };

  const handleGeneratePdf = async () => {
    setError(null);

    // Validation
    const errors = validateDC1Form(formData);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const blob = await generatePdf(formData);
      downloadPdf(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateWord = async () => {
    setError(null);

    // Validation
    const errors = validateDC1Form(formData);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsGeneratingWord(true);

    try {
      const blob = await generateWord(formData);
      downloadWord(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du Word');
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dc1-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Document Analysis Section */}
      <section className="section">
        <h2 className="section-title">
          Import automatique depuis un document RC
        </h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 14,
            marginBottom: 'var(--space-md)',
          }}
        >
          Glissez-déposez un Règlement de Consultation (RC) pour pré-remplir
          automatiquement les sections A, B et C du formulaire.
        </p>

        {!isAnalyzing && !extractedData && (
          <DocumentDropzone
            onFileAccepted={handleFileAccepted}
            isDisabled={isAnalyzing}
          />
        )}

        {isAnalyzing && <AnalysisProgress filename={selectedFile?.name} />}

        {analysisError && (
          <Alert type="error" style={{ marginTop: 'var(--space-md)' }}>
            {analysisError}
          </Alert>
        )}

        {extractedData && (
          <ExtractedDataPreview
            data={extractedData}
            onConfirm={handleApplyExtractedData}
            onCancel={handleCancelExtraction}
          />
        )}
      </section>

      <SectionA />
      <SectionB />
      <SectionC />
      <SectionD />

      {isGroupement && <SectionE />}

      <SectionF />

      {error && <Alert type="error">{error}</Alert>}

      {validationErrors.length > 0 && (
        <Alert type="error">
          <strong>Veuillez corriger les erreurs suivantes :</strong>
          <ul style={{ margin: 'var(--space-sm) 0 0', paddingLeft: 'var(--space-lg)' }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      <section className="section">
        <h2 className="section-title">Actions</h2>

        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Button variant="success" onClick={handleGeneratePdf} loading={isGeneratingPdf}>
            Générer PDF
          </Button>

          <Button variant="primary" onClick={handleGenerateWord} loading={isGeneratingWord}>
            Exporter Word
          </Button>

          <Button variant="secondary" onClick={handleExportJson}>
            Exporter JSON
          </Button>

          <Button variant="secondary" onClick={() => setShowJson(!showJson)}>
            {showJson ? 'Masquer' : 'Afficher'} les données
          </Button>

          <Button variant="danger" onClick={resetForm}>
            Réinitialiser
          </Button>
        </div>

        {onGoToDC2 && (
          <div
            style={{
              marginTop: 'var(--space-lg)',
              padding: 'var(--space-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 'var(--space-sm)',
                color: 'var(--primary)',
              }}
            >
              Créer le DC2 associé
            </h3>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 14,
                marginBottom: 'var(--space-md)',
              }}
            >
              Le formulaire DC2 (Déclaration du candidat) sera pré-rempli avec les données du DC1
              et les informations Pappers.
            </p>
            <Button variant="primary" onClick={onGoToDC2}>
              Créer le DC2
            </Button>
          </div>
        )}

        {showJson && (
          <pre style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: '#1e1e1e',
            color: '#d4d4d4',
            borderRadius: 'var(--radius-md)',
            overflow: 'auto',
            maxHeight: 400,
            fontSize: 12,
          }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
