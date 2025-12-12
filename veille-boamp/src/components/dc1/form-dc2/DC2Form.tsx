import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { DC2SectionA } from './DC2SectionA';
import { DC2SectionB } from './DC2SectionB';
import { DC2SectionC } from './DC2SectionC';
import { DC2SectionD } from './DC2SectionD';
import { DC2SectionE } from './DC2SectionE';
import { Button, Alert } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import { generateDC2Pdf, downloadPdf, generateDC2Word, downloadWord } from '@/services/dc1';
import { QuotaExceededError } from '@/services/dc1/api';
import { validateDC2Form } from '@/lib/dc1/utils/validation';
import type { ValidationError } from '@/lib/dc1/utils/validation';
import { QuotaExceededModal } from '@/components/QuotaExceededModal';

interface DC2FormProps {
  onBackToDC1?: () => void;
}

export function DC2Form({ onBackToDC1 }: DC2FormProps) {
  const { user } = useUser();
  const { formData, resetForm } = useFormDataDC2();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [quotaModal, setQuotaModal] = useState<{ open: boolean; used: number; limit: number }>({ open: false, used: 0, limit: 5 });

  const handleGeneratePdf = async () => {
    setError(null);

    const errors = validateDC2Form(formData);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const blob = await generateDC2Pdf(formData, {
        userId: user?.id,
      });
      downloadPdf(blob, 'DC2-Declaration.pdf');
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        setQuotaModal({ open: true, used: err.used, limit: err.limit });
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération du PDF');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateWord = async () => {
    setError(null);

    const errors = validateDC2Form(formData);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsGeneratingWord(true);

    try {
      const blob = await generateDC2Word(formData, {
        userId: user?.id,
      });
      downloadWord(blob, 'DC2-Declaration.docx');
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        setQuotaModal({ open: true, used: err.used, limit: err.limit });
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération du Word');
      }
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
    a.download = 'dc2-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header with back button */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        {onBackToDC1 && (
          <Button
            variant="secondary"
            onClick={onBackToDC1}
            style={{ marginBottom: 'var(--space-md)' }}
          >
            ← Retour au DC1
          </Button>
        )}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
          DC2 - Déclaration du candidat
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
          Déclaration du candidat individuel ou du membre du groupement
        </p>
      </div>

      <DC2SectionA />
      <DC2SectionB />
      <DC2SectionC />
      <DC2SectionD />
      <DC2SectionE />

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

        {showJson && (
          <pre
            style={{
              marginTop: 'var(--space-md)',
              padding: 'var(--space-md)',
              background: '#1e1e1e',
              color: '#d4d4d4',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              maxHeight: 400,
              fontSize: 12,
            }}
          >
            {JSON.stringify(formData, null, 2)}
          </pre>
        )}
      </section>

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={quotaModal.open}
        onClose={() => setQuotaModal({ ...quotaModal, open: false })}
        used={quotaModal.used}
        limit={quotaModal.limit}
      />
    </div>
  );
}
