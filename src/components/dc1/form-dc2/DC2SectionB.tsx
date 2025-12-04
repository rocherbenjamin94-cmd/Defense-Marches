import { Input } from '@/components/dc1/common';
import { useFormDataDC2 } from '@/hooks/dc1';
import { dc2HelpTexts } from '@/lib/dc1/data/helpTexts';

export function DC2SectionB() {
  const { formData, updateSituationJuridique } = useFormDataDC2();
  const { situation_juridique } = formData;

  const hasApiData = situation_juridique.forme_juridique && situation_juridique.code_naf;

  return (
    <section className="section">
      <h2 className="section-title">B - Renseignements relatifs à la situation juridique</h2>

      {hasApiData && (
        <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-muted)', fontSize: 14 }}>
          Certaines informations sont pré-remplies depuis Pappers. Vous pouvez les modifier si nécessaire.
        </p>
      )}

      <div className="form-row">
        <Input
          label="Forme juridique *"
          type="text"
          value={situation_juridique.forme_juridique}
          onChange={(e) => updateSituationJuridique({ forme_juridique: e.target.value })}
          placeholder="SARL, SAS, SA, EURL..."
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.forme_juridique}
          required
        />

        <Input
          label="Date de création"
          type="text"
          value={situation_juridique.date_creation}
          onChange={(e) => updateSituationJuridique({ date_creation: e.target.value })}
          placeholder="JJ/MM/AAAA"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.date_creation}
        />
      </div>

      <div className="form-row">
        <Input
          label="Capital social"
          type="text"
          value={situation_juridique.capital_social}
          onChange={(e) => updateSituationJuridique({ capital_social: e.target.value })}
          placeholder="100 000"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.capital_social}
        />

        <Input
          label="Devise"
          type="text"
          value={situation_juridique.devise_capital}
          onChange={(e) => updateSituationJuridique({ devise_capital: e.target.value })}
          placeholder="EUR"
          style={{ maxWidth: 100 }}
          helpText={dc2HelpTexts.situation_juridique.devise_capital}
        />
      </div>

      <div className="form-row">
        <Input
          label="Numéro RCS"
          type="text"
          value={situation_juridique.numero_rcs}
          onChange={(e) => updateSituationJuridique({ numero_rcs: e.target.value })}
          placeholder="123 456 789"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.numero_rcs}
        />

        <Input
          label="Ville d'inscription RCS"
          type="text"
          value={situation_juridique.ville_rcs}
          onChange={(e) => updateSituationJuridique({ ville_rcs: e.target.value })}
          placeholder="Paris"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.ville_rcs}
        />
      </div>

      <Input
        label="Numéro RM (Répertoire des Métiers)"
        type="text"
        value={situation_juridique.numero_rm}
        onChange={(e) => updateSituationJuridique({ numero_rm: e.target.value })}
        placeholder="Si applicable"
        helpText={dc2HelpTexts.situation_juridique.numero_rm}
      />

      <div className="form-row">
        <Input
          label="Code NAF *"
          type="text"
          value={situation_juridique.code_naf}
          onChange={(e) => updateSituationJuridique({ code_naf: e.target.value })}
          placeholder="7112B"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.code_naf}
          required
        />

        <Input
          label="Libellé NAF"
          type="text"
          value={situation_juridique.libelle_naf}
          onChange={(e) => updateSituationJuridique({ libelle_naf: e.target.value })}
          placeholder="Ingénierie, études techniques"
          badge={hasApiData ? 'api' : undefined}
          helpText={dc2HelpTexts.situation_juridique.libelle_naf}
        />
      </div>
    </section>
  );
}
