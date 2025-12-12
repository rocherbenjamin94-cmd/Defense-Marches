import { RadioCard, Input, Alert } from '@/components/dc1/common';
import { useFormData } from '@/hooks/dc1';

export function SectionF() {
  const { formData, updateEngagements } = useFormData();

  return (
    <section className="section">
      <h2 className="section-title">F - Engagements du candidat</h2>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label className="checkbox-label" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.engagements.attestation_exclusion}
            onChange={(e) => updateEngagements({ attestation_exclusion: e.target.checked })}
          />
          <span>
            <strong>Attestation sur l'honneur <span style={{ color: 'var(--color-error)' }}>*</span></strong> : Le candidat déclare ne pas faire l'objet d'une interdiction
            de soumissionner telle que définie aux articles L.2141-1 à L.2141-5 et L.2141-7 à L.2141-10
            du code de la commande publique.
          </span>
        </label>
      </div>

      {!formData.engagements.attestation_exclusion && (
        <Alert type="warning">
          Cette attestation est obligatoire pour toute candidature aux marchés publics.
        </Alert>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-md)' }}>
        Justification des capacités professionnelles, techniques et financières <span style={{ color: 'var(--color-error)' }}>*</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <RadioCard
          name="type_capacites"
          value="dc2"
          checked={formData.engagements.type_capacites === 'dc2'}
          onChange={(value) => updateEngagements({ type_capacites: value as 'dc2' })}
          title="Via le formulaire DC2"
          description="Utilisation du formulaire standard DC2"
        />

        <RadioCard
          name="type_capacites"
          value="documents"
          checked={formData.engagements.type_capacites === 'documents'}
          onChange={(value) => updateEngagements({ type_capacites: value as 'documents' })}
          title="Via documents propres"
          description="Documents libres justifiant les capacités"
        />
      </div>

      <Input
        label="URL d'accès aux documents (optionnel)"
        type="url"
        value={formData.engagements.url_documents}
        onChange={(e) => updateEngagements({ url_documents: e.target.value })}
        placeholder="https://..."
      />

      <Input
        label="Modalités d'accès aux documents (optionnel)"
        type="text"
        value={formData.engagements.acces_documents}
        onChange={(e) => updateEngagements({ acces_documents: e.target.value })}
        placeholder="Ex: Identifiant et mot de passe fournis sur demande"
      />
    </section>
  );
}
