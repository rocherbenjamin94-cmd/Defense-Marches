import { Input, Button } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import type { Reference } from '@/lib/dc1/types';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

interface ReferenceCardProps {
  reference: Reference;
  index: number;
}

export function ReferenceCard({ reference, index }: ReferenceCardProps) {
  const { updateReference, removeReference } = useFormDataDC2();

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
          Référence {index + 1}
        </h4>
        <Button
          variant="danger"
          onClick={() => removeReference(reference.id)}
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          Supprimer
        </Button>
      </div>

      <div className="form-row">
        <Input
          label="Client *"
          type="text"
          value={reference.client}
          onChange={(e) => updateReference(reference.id, { client: e.target.value })}
          placeholder="Nom du client"
          helpText={dc2HelpTexts.reference.client}
          required
        />

        <Input
          label="Année"
          type="text"
          value={reference.annee}
          onChange={(e) => updateReference(reference.id, { annee: e.target.value })}
          placeholder="2023"
          style={{ maxWidth: 100 }}
          helpText={dc2HelpTexts.reference.annee}
        />
      </div>

      <Input
        label="Objet du marché *"
        type="text"
        value={reference.objet}
        onChange={(e) => updateReference(reference.id, { objet: e.target.value })}
        placeholder="Description de la prestation"
        helpText={dc2HelpTexts.reference.objet}
        required
      />

      <div className="form-row">
        <Input
          label="Montant HT"
          type="text"
          value={reference.montant}
          onChange={(e) => updateReference(reference.id, { montant: e.target.value })}
          placeholder="150 000 €"
          helpText={dc2HelpTexts.reference.montant}
        />

        <Input
          label="Contact de référence"
          type="text"
          value={reference.contact}
          onChange={(e) => updateReference(reference.id, { contact: e.target.value })}
          placeholder="Nom - Tél/Email"
          helpText={dc2HelpTexts.reference.contact}
        />
      </div>
    </div>
  );
}
