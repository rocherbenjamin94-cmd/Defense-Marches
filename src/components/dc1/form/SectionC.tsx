import { RadioCard, Textarea } from '@/components/dc1/common';
import { useFormData } from '@/hooks/dc1';
import { dc1HelpTexts } from '@/lib/dc1/data/helpTexts';

export function SectionC() {
  const { formData, updateCandidature } = useFormData();

  return (
    <section className="section">
      <h2 className="section-title">C - Objet de la candidature</h2>

      <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-muted)' }}>
        La présente candidature est présentée pour :
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <RadioCard
          name="candidature_type"
          value="marche_unique"
          checked={formData.candidature.type === 'marche_unique'}
          onChange={(value) => updateCandidature({ type: value as 'marche_unique' })}
          title="Marché ou accord-cadre unique"
          description="Pas de découpage en lots"
        />

        <RadioCard
          name="candidature_type"
          value="tous_lots"
          checked={formData.candidature.type === 'tous_lots'}
          onChange={(value) => updateCandidature({ type: value as 'tous_lots' })}
          title="L'ensemble des lots"
          description="Candidature pour tous les lots de la consultation"
        />

        <RadioCard
          name="candidature_type"
          value="lots_specifiques"
          checked={formData.candidature.type === 'lots_specifiques'}
          onChange={(value) => updateCandidature({ type: value as 'lots_specifiques' })}
          title="Certains lots spécifiques"
          description="Candidature pour une sélection de lots"
        />
      </div>

      {formData.candidature.type === 'lots_specifiques' && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <Textarea
            label="Numéros ou intitulés des lots concernés *"
            value={formData.candidature.lots}
            onChange={(e) => updateCandidature({ lots: e.target.value })}
            placeholder="Ex: Lot 1 - Fourniture de matériel informatique&#10;Lot 3 - Maintenance"
            helpText={dc1HelpTexts.candidature.lots}
          />
        </div>
      )}
    </section>
  );
}
