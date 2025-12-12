import { Input } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

export function DC2SectionC() {
  const { formData, updateCAGlobal, updateCADomaine, updateCapacitesEconomiques } = useFormDataDC2();
  const { capacites_economiques } = formData;

  return (
    <section className="section">
      <h2 className="section-title">C - Capacités économiques et financières</h2>

      {/* Chiffre d'affaires global */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
        Chiffre d'affaires global HT (3 dernières années) *
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
        {dc2HelpTexts.capacites_economiques.chiffre_affaires_global}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
        {capacites_economiques.chiffre_affaires_global.map((ca: any, index: number) => (
          <Input
            key={ca.annee}
            label={`Année ${ca.annee}`}
            type="text"
            value={ca.montant}
            onChange={(e) => updateCAGlobal(index, { montant: e.target.value })}
            placeholder="1 000 000 €"
          />
        ))}
      </div>

      {/* Chiffre d'affaires spécifique au domaine */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
        Chiffre d'affaires dans le domaine d'activité concerné HT
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
        {dc2HelpTexts.capacites_economiques.chiffre_affaires_domaine}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
        {capacites_economiques.chiffre_affaires_domaine.map((ca: any, index: number) => (
          <Input
            key={ca.annee}
            label={`Année ${ca.annee}`}
            type="text"
            value={ca.montant}
            onChange={(e) => updateCADomaine(index, { montant: e.target.value })}
            placeholder="500 000 €"
          />
        ))}
      </div>

      {/* Assurances */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
        Assurances professionnelles
      </h3>

      <div className="form-row">
        <Input
          label="Assurance Responsabilité Civile Professionnelle"
          type="text"
          value={capacites_economiques.assurance_rc_pro}
          onChange={(e) => updateCapacitesEconomiques({ assurance_rc_pro: e.target.value })}
          placeholder="Nom assureur - N° police - Montant garanti"
          helpText={dc2HelpTexts.capacites_economiques.assurance_rc_pro}
        />

        <Input
          label="Assurance Décennale (si applicable)"
          type="text"
          value={capacites_economiques.assurance_decennale}
          onChange={(e) => updateCapacitesEconomiques({ assurance_decennale: e.target.value })}
          placeholder="Nom assureur - N° police - Montant garanti"
          helpText={dc2HelpTexts.capacites_economiques.assurance_decennale}
        />
      </div>
    </section>
  );
}
