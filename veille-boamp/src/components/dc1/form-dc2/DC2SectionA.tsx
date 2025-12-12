import { Input } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

export function DC2SectionA() {
  const { formData } = useFormDataDC2();
  const { identification } = formData;

  const hasData = identification.siret && identification.denomination_sociale;

  return (
    <section className="section">
      <h2 className="section-title">A - Identification du candidat</h2>

      {hasData ? (
        <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-muted)', fontSize: 14 }}>
          Ces informations sont pré-remplies depuis le DC1. Retournez au DC1 pour les modifier.
        </p>
      ) : (
        <p style={{ marginBottom: 'var(--space-md)', color: 'var(--warning)', fontSize: 14 }}>
          Aucune donnée pré-remplie. Veuillez d'abord compléter le DC1.
        </p>
      )}

      <div className="form-row">
        <Input
          label="SIRET"
          type="text"
          value={identification.siret}
          disabled
          badge="api"
          helpText={dc2HelpTexts.identification.siret}
        />

        <Input
          label="SIREN"
          type="text"
          value={identification.siren}
          disabled
          badge="api"
          helpText={dc2HelpTexts.identification.siren}
        />
      </div>

      <div className="form-row">
        <Input
          label="Nom commercial"
          type="text"
          value={identification.nom_commercial}
          disabled
          badge="api"
          helpText={dc2HelpTexts.identification.nom_commercial}
        />

        <Input
          label="Dénomination sociale"
          type="text"
          value={identification.denomination_sociale}
          disabled
          badge="api"
          helpText={dc2HelpTexts.identification.denomination_sociale}
        />
      </div>

      <Input
        label="Adresse de l'établissement"
        type="text"
        value={identification.adresse_etablissement}
        disabled
        badge="api"
        helpText={dc2HelpTexts.identification.adresse_etablissement}
      />

      <Input
        label="Adresse du siège social"
        type="text"
        value={identification.adresse_siege}
        disabled
        badge="api"
        helpText={dc2HelpTexts.identification.adresse_siege}
      />

      <div className="form-row">
        <Input
          label="Email"
          type="email"
          value={identification.email}
          disabled
          badge="api"
          helpText={dc2HelpTexts.identification.email}
        />

        <Input
          label="Téléphone"
          type="tel"
          value={identification.telephone}
          disabled
          badge="api"
          helpText={dc2HelpTexts.identification.telephone}
        />

        <Input
          label="Fax"
          type="tel"
          value={identification.fax}
          disabled
          helpText={dc2HelpTexts.identification.fax}
        />
      </div>
    </section>
  );
}
