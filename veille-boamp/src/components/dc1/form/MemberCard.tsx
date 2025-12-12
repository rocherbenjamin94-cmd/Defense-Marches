import { Input, Textarea, Button } from '@/components/dc1/common';
import { SiretLookup } from './SiretLookup';
import type { MembreGroupement, EntrepriseData } from '@/lib/dc1/types';
import { dc1HelpTexts } from '@/lib/dc1/data/helpTexts';

interface MemberCardProps {
  membre: MembreGroupement;
  index: number;
  showPrestations: boolean;
  onUpdate: (id: number, data: Partial<MembreGroupement>) => void;
  onRemove: (id: number) => void;
}

export function MemberCard({ membre, index, showPrestations, onUpdate, onRemove }: MemberCardProps) {
  const handleEntrepriseSelect = (data: EntrepriseData) => {
    onUpdate(membre.id, {
      siret: data.siret,
      nom_commercial: data.nom_commercial,
      denomination_sociale: data.denomination_sociale,
      adresse: data.adresse_etablissement,
    });
  };

  return (
    <div className="member-card">
      <div className="member-card-header">
        <span className="member-card-title">Membre {index + 1}</span>
        <Button variant="danger" onClick={() => onRemove(membre.id)} style={{ padding: '6px 12px', fontSize: 12 }}>
          Supprimer
        </Button>
      </div>

      <SiretLookup onSelect={handleEntrepriseSelect} currentSiret={membre.siret} />

      <div className="form-row">
        <Input
          label="SIRET"
          type="text"
          value={membre.siret}
          onChange={(e) => onUpdate(membre.id, { siret: e.target.value })}
          helpText={dc1HelpTexts.membre.siret}
        />
        <Input
          label="Nom commercial"
          type="text"
          value={membre.nom_commercial}
          onChange={(e) => onUpdate(membre.id, { nom_commercial: e.target.value })}
        />
      </div>

      <Input
        label="Dénomination sociale"
        type="text"
        value={membre.denomination_sociale}
        onChange={(e) => onUpdate(membre.id, { denomination_sociale: e.target.value })}
        helpText={dc1HelpTexts.membre.denomination_sociale}
      />

      <Input
        label="Adresse"
        type="text"
        value={membre.adresse}
        onChange={(e) => onUpdate(membre.id, { adresse: e.target.value })}
        helpText={dc1HelpTexts.membre.adresse}
      />

      <div className="form-row">
        <Input
          label="Email"
          type="email"
          value={membre.email}
          onChange={(e) => onUpdate(membre.id, { email: e.target.value })}
          helpText={dc1HelpTexts.membre.email}
        />
        <Input
          label="Téléphone"
          type="tel"
          value={membre.telephone}
          onChange={(e) => onUpdate(membre.id, { telephone: e.target.value })}
          helpText={dc1HelpTexts.membre.telephone}
        />
      </div>

      {showPrestations && (
        <Textarea
          label="Prestations exécutées par ce membre *"
          value={membre.prestations}
          onChange={(e) => onUpdate(membre.id, { prestations: e.target.value })}
          placeholder="Décrivez les prestations dont ce membre du groupement est responsable..."
        />
      )}
    </div>
  );
}
