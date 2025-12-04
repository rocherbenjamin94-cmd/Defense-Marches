import { Input, Button } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import type { Certification } from '@/lib/dc1/types';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

interface CertificationCardProps {
  certification: Certification;
  index: number;
}

export function CertificationCard({ certification, index }: CertificationCardProps) {
  const { updateCertification, removeCertification } = useFormDataDC2();

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Certification {index + 1}
        </h4>
        <Button
          variant="danger"
          onClick={() => removeCertification(certification.id)}
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          Supprimer
        </Button>
      </div>

      <div className="form-row">
        <Input
          label="Nom de la certification *"
          type="text"
          value={certification.nom}
          onChange={(e) => updateCertification(certification.id, { nom: e.target.value })}
          placeholder="ISO 9001, OPQIBI, Qualibat..."
          helpText={dc2HelpTexts.certification.nom}
          required
        />

        <Input
          label="Organisme certificateur"
          type="text"
          value={certification.organisme}
          onChange={(e) => updateCertification(certification.id, { organisme: e.target.value })}
          placeholder="AFNOR, Bureau Veritas..."
          helpText={dc2HelpTexts.certification.organisme}
        />
      </div>

      <Input
        label="Date de validité"
        type="text"
        value={certification.date_validite}
        onChange={(e) => updateCertification(certification.id, { date_validite: e.target.value })}
        placeholder="31/12/2025"
        style={{ maxWidth: 200 }}
        helpText={dc2HelpTexts.certification.date_validite}
      />
    </div>
  );
}
