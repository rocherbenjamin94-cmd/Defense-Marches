import { Button, Alert } from '../common';
import type { ExtractedDocumentData } from '@/lib/dc1/types';

interface ExtractedDataPreviewProps {
  data: ExtractedDocumentData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExtractedDataPreview({
  data,
  onConfirm,
  onCancel,
}: ExtractedDataPreviewProps) {
  const hasAcheteur =
    data.acheteur?.nom ||
    data.acheteur?.reference_avis ||
    data.acheteur?.reference_dossier;
  const hasConsultation = data.consultation?.objet;
  const hasLots = data.candidature?.lots && data.candidature.lots.length > 0;
  const hasInfo =
    data.informations?.date_limite_reponse ||
    (data.informations?.criteres_selection &&
      data.informations.criteres_selection.length > 0);

  const getConfidenceColor = () => {
    if (data.confidence >= 70) return 'var(--color-success)';
    if (data.confidence >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getConfidenceText = () => {
    if (data.confidence >= 70) return 'Bonne';
    if (data.confidence >= 50) return 'Moyenne';
    return 'Faible';
  };

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header with confidence */}
      <div
        style={{
          padding: 'var(--space-md)',
          background: 'var(--bg-muted)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0 }}>Données extraites</h3>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: getConfidenceColor(),
          }}
        >
          Confiance: {getConfidenceText()} ({data.confidence}%)
        </span>
      </div>

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <Alert type="warning" style={{ marginBottom: 'var(--space-md)' }}>
            {data.warnings.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </Alert>
        )}

        {/* No data extracted */}
        {!hasAcheteur && !hasConsultation && !hasLots && (
          <Alert type="error" style={{ marginBottom: 'var(--space-md)' }}>
            Aucune donnée n'a pu être extraite de ce document. Vérifiez qu'il
            s'agit bien d'un Règlement de Consultation.
          </Alert>
        )}

        {/* Section A - Acheteur */}
        {hasAcheteur && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h4
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 'var(--space-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              A - Acheteur
            </h4>
            <div
              style={{
                background: 'var(--bg-muted)',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {data.acheteur?.nom && (
                <p style={{ margin: '0 0 var(--space-xs) 0' }}>
                  <strong>Nom :</strong> {data.acheteur.nom}
                </p>
              )}
              {data.acheteur?.reference_avis && (
                <p style={{ margin: '0 0 var(--space-xs) 0' }}>
                  <strong>Réf. avis :</strong> {data.acheteur.reference_avis}
                </p>
              )}
              {data.acheteur?.reference_dossier && (
                <p style={{ margin: 0 }}>
                  <strong>Réf. dossier :</strong>{' '}
                  {data.acheteur.reference_dossier}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Section B - Consultation */}
        {hasConsultation && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h4
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 'var(--space-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              B - Objet de la consultation
            </h4>
            <div
              style={{
                background: 'var(--bg-muted)',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <p style={{ margin: 0 }}>{data.consultation?.objet}</p>
            </div>
          </div>
        )}

        {/* Section C - Lots */}
        {hasLots && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h4
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 'var(--space-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              C - Lots identifiés ({data.candidature?.lots?.length})
            </h4>
            <div
              style={{
                background: 'var(--bg-muted)',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 'var(--space-lg)' }}>
                {data.candidature?.lots?.map((lot, i) => (
                  <li key={i} style={{ marginBottom: 'var(--space-xs)' }}>
                    <strong>Lot {lot.numero} :</strong> {lot.intitule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Informational */}
        {hasInfo && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h4
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 'var(--space-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Informations complémentaires
            </h4>
            <Alert type="info">
              {data.informations?.date_limite_reponse && (
                <p style={{ margin: '0 0 var(--space-xs) 0' }}>
                  <strong>Date limite de réponse :</strong>{' '}
                  {data.informations.date_limite_reponse}
                </p>
              )}
              {data.informations?.criteres_selection &&
                data.informations.criteres_selection.length > 0 && (
                  <div>
                    <strong>Critères de sélection :</strong>
                    <ul
                      style={{
                        margin: 'var(--space-xs) 0 0 0',
                        paddingLeft: 'var(--space-lg)',
                      }}
                    >
                      {data.informations.criteres_selection.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </Alert>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-lg)',
            paddingTop: 'var(--space-md)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <Button
            variant="success"
            onClick={onConfirm}
            disabled={!hasAcheteur && !hasConsultation && !hasLots}
          >
            Appliquer au formulaire
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}
