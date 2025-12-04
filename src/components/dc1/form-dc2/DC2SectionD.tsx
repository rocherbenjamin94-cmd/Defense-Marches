import { Input, Button } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import { ReferenceCard } from './ReferenceCard';
import { CertificationCard } from './CertificationCard';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

export function DC2SectionD() {
  const {
    formData,
    updateEffectif,
    updateCapacitesTechniques,
    addReference,
    addCertification,
  } = useFormDataDC2();
  const { capacites_techniques } = formData;

  return (
    <section className="section">
      <h2 className="section-title">D - Capacités techniques et professionnelles</h2>

      {/* Effectifs */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
        Effectifs moyens annuels (3 dernières années) *
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
        {dc2HelpTexts.capacites_techniques.effectif_moyen}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
        {capacites_techniques.effectifs.map((eff: any, index: number) => (
          <Input
            key={eff.annee}
            label={`Année ${eff.annee}`}
            type="text"
            value={eff.nombre}
            onChange={(e) => updateEffectif(index, { nombre: e.target.value })}
            placeholder="25"
          />
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <Input
          label="Dont effectif d'encadrement"
          type="text"
          value={capacites_techniques.effectif_encadrement}
          onChange={(e) => updateCapacitesTechniques({ effectif_encadrement: e.target.value })}
          placeholder="5"
          style={{ maxWidth: 200 }}
          helpText={dc2HelpTexts.capacites_techniques.effectif_encadrement}
        />
      </div>

      {/* Références */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
        Références / Marchés similaires
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
        Indiquez vos principales références dans le domaine concerné
      </p>

      {capacites_techniques.references.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>
          Aucune référence ajoutée
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          {capacites_techniques.references.map((ref: any, index: number) => (
            <ReferenceCard key={ref.id} reference={ref} index={index} />
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={addReference}>
        + Ajouter une référence
      </Button>

      {/* Certifications */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
        Certifications et qualifications
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
        ISO, OPQIBI, Qualibat, RGE, etc.
      </p>

      {capacites_techniques.certifications.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>
          Aucune certification ajoutée
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          {capacites_techniques.certifications.map((cert: any, index: number) => (
            <CertificationCard key={cert.id} certification={cert} index={index} />
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={addCertification}>
        + Ajouter une certification
      </Button>
    </section>
  );
}
