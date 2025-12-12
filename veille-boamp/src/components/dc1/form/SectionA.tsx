import { Input } from '@/components/dc1/common';
import { useFormData } from '@/hooks/dc1';
import { dc1HelpTexts } from '@/lib/dc1/data/helpTexts';

export function SectionA() {
  const { formData, updateAcheteur } = useFormData();

  return (
    <section className="section">
      <h2 className="section-title">A - Identification de l'acheteur</h2>

      <Input
        label="Nom de l'acheteur *"
        type="text"
        value={formData.acheteur.nom}
        onChange={(e) => updateAcheteur({ nom: e.target.value })}
        placeholder="Ex: Mairie de Paris, Conseil Régional..."
        helpText={dc1HelpTexts.acheteur.nom}
        required
      />

      <div className="form-row">
        <Input
          label="Référence de l'avis de publicité"
          type="text"
          value={formData.acheteur.reference_avis}
          onChange={(e) => updateAcheteur({ reference_avis: e.target.value })}
          placeholder="Ex: BOAMP 25-12345"
          helpText={dc1HelpTexts.acheteur.reference_avis}
        />

        <Input
          label="Référence du dossier de consultation"
          type="text"
          value={formData.acheteur.reference_dossier}
          onChange={(e) => updateAcheteur({ reference_dossier: e.target.value })}
          placeholder="Ex: DCE-2025-001"
          helpText={dc1HelpTexts.acheteur.reference_dossier}
        />
      </div>
    </section>
  );
}
