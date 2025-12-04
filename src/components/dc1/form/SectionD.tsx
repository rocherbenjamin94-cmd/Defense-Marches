import { RadioCard, Input } from '@/components/dc1/common';
import { useFormData } from '@/hooks/dc1';
import { SiretLookup } from './SiretLookup';
import type { EntrepriseData } from '@/lib/dc1/types';
import { dc1HelpTexts } from '@/lib/dc1/data/helpTexts';

export function SectionD() {
  const { formData, updateCandidat, updateGroupement, setPappersData } = useFormData();

  const handleEntrepriseSelect = (data: EntrepriseData) => {
    updateCandidat({
      siret: data.siret,
      siren: data.siren,
      nom_commercial: data.nom_commercial,
      denomination_sociale: data.denomination_sociale,
      adresse_etablissement: data.adresse_etablissement,
      adresse_siege: data.adresse_siege || data.adresse_etablissement,
    });
    // Stocker les données Pappers complètes pour le pré-remplissage DC2
    setPappersData(data);
  };

  const isGroupement = formData.candidat.mode === 'groupement';
  const hasApiData = formData.candidat.siret && formData.candidat.denomination_sociale;

  return (
    <section className="section">
      <h2 className="section-title">D - Présentation du candidat</h2>

      <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-muted)' }}>
        Le candidat se présente :
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <RadioCard
          name="mode_candidature"
          value="seul"
          checked={formData.candidat.mode === 'seul'}
          onChange={(value) => updateCandidat({ mode: value as 'seul' })}
          title="Seul"
          description="Opérateur économique unique"
        />

        <RadioCard
          name="mode_candidature"
          value="groupement"
          checked={formData.candidat.mode === 'groupement'}
          onChange={(value) => updateCandidat({ mode: value as 'groupement' })}
          title="En groupement"
          description="Plusieurs opérateurs économiques"
        />
      </div>

      {isGroupement && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{ marginBottom: 'var(--space-sm)', fontWeight: 500 }}>Type de groupement :</p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <RadioCard
              name="type_groupement"
              value="conjoint"
              checked={formData.groupement?.type === 'conjoint'}
              onChange={(value) => updateGroupement({ type: value as 'conjoint' })}
              title="Conjoint"
              description="Chaque membre est engagé pour sa part"
            />

            <RadioCard
              name="type_groupement"
              value="solidaire"
              checked={formData.groupement?.type === 'solidaire'}
              onChange={(value) => updateGroupement({ type: value as 'solidaire' })}
              title="Solidaire"
              description="Chaque membre est engagé pour la totalité"
            />
          </div>

          {formData.groupement?.type === 'conjoint' && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <p style={{ marginBottom: 'var(--space-sm)', fontWeight: 500 }}>
                Le mandataire est-il solidaire ?
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <RadioCard
                  name="mandataire_solidaire"
                  value="oui"
                  checked={formData.groupement?.mandataire_solidaire === 'oui'}
                  onChange={(value) => updateGroupement({ mandataire_solidaire: value as 'oui' })}
                  title="Oui"
                />
                <RadioCard
                  name="mandataire_solidaire"
                  value="non"
                  checked={formData.groupement?.mandataire_solidaire === 'non'}
                  onChange={(value) => updateGroupement({ mandataire_solidaire: value as 'non' })}
                  title="Non"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)' }}>
        {isGroupement ? 'Identification du mandataire' : 'Identification du candidat'}
      </h3>

      <SiretLookup
        onSelect={handleEntrepriseSelect}
        currentSiret={formData.candidat.siret}
      />

      <div className="form-row">
        <Input
          label="SIRET"
          type="text"
          value={formData.candidat.siret}
          onChange={(e) => updateCandidat({ siret: e.target.value })}
          placeholder="14 chiffres"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc1HelpTexts.candidat.siret}
        />

        <Input
          label="Nom commercial"
          type="text"
          value={formData.candidat.nom_commercial}
          onChange={(e) => updateCandidat({ nom_commercial: e.target.value })}
          badge={hasApiData ? 'api' : undefined}
          helpText={dc1HelpTexts.candidat.nom_commercial}
        />
      </div>

      <Input
        label="Dénomination sociale"
        type="text"
        value={formData.candidat.denomination_sociale}
        onChange={(e) => updateCandidat({ denomination_sociale: e.target.value })}
        badge={hasApiData ? 'api' : undefined}
        helpText={dc1HelpTexts.candidat.denomination_sociale}
      />

      <Input
        label="Adresse de l'établissement"
        type="text"
        value={formData.candidat.adresse_etablissement}
        onChange={(e) => updateCandidat({ adresse_etablissement: e.target.value })}
        badge={hasApiData ? 'api' : undefined}
        helpText={dc1HelpTexts.candidat.adresse_etablissement}
      />

      <Input
        label="Adresse du siège social (si différente)"
        type="text"
        value={formData.candidat.adresse_siege}
        onChange={(e) => updateCandidat({ adresse_siege: e.target.value })}
        helpText={dc1HelpTexts.candidat.adresse_siege}
      />

      <div className="form-row">
        <Input
          label="Email *"
          type="email"
          value={formData.candidat.email}
          onChange={(e) => updateCandidat({ email: e.target.value })}
          placeholder="contact@entreprise.fr"
          helpText={dc1HelpTexts.candidat.email}
          required
        />

        <Input
          label="Téléphone *"
          type="tel"
          value={formData.candidat.telephone}
          onChange={(e) => updateCandidat({ telephone: e.target.value })}
          placeholder="01 23 45 67 89"
          helpText={dc1HelpTexts.candidat.telephone}
          required
        />

        <Input
          label="Fax"
          type="tel"
          value={formData.candidat.fax}
          onChange={(e) => updateCandidat({ fax: e.target.value })}
        />
      </div>
    </section>
  );
}
