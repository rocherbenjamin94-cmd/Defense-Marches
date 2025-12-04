import { Textarea } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

export function DC2SectionE() {
  const { formData, updateMoyensTechniques } = useFormDataDC2();
  const { moyens_techniques } = formData;

  return (
    <section className="section">
      <h2 className="section-title">E - Moyens techniques</h2>

      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 'var(--space-md)' }}>
        Décrivez les moyens techniques dont dispose votre entreprise pour l'exécution du marché.
      </p>

      <Textarea
        label="Équipements techniques"
        value={moyens_techniques.equipements}
        onChange={(e) => updateMoyensTechniques({ equipements: e.target.value })}
        placeholder="Logiciels, matériel informatique, équipements de mesure, etc."
        rows={4}
        helpText={dc2HelpTexts.moyens_techniques.equipements}
      />

      <Textarea
        label="Outillage et matériel"
        value={moyens_techniques.outillage}
        onChange={(e) => updateMoyensTechniques({ outillage: e.target.value })}
        placeholder="Véhicules, engins, outillage spécialisé, etc."
        rows={4}
        helpText={dc2HelpTexts.moyens_techniques.outillage}
      />

      <Textarea
        label="Locaux"
        value={moyens_techniques.locaux}
        onChange={(e) => updateMoyensTechniques({ locaux: e.target.value })}
        placeholder="Bureaux, ateliers, entrepôts, surfaces, etc."
        rows={4}
        helpText={dc2HelpTexts.moyens_techniques.locaux}
      />
    </section>
  );
}
