import { Button, Alert } from '@/components/dc1/common';
import { MemberCard } from './MemberCard';
import { useFormData } from '@/hooks/dc1';

export function SectionE() {
  const { formData, addMembre, updateMembre, removeMembre } = useFormData();

  const isConjoint = formData.groupement?.type === 'conjoint';
  const membres = formData.groupement?.membres || [];

  return (
    <section className="section">
      <h2 className="section-title">E - Membres du groupement</h2>

      <Alert type="info">
        Ajoutez les autres membres du groupement (hors mandataire).
        {isConjoint && ' Pour un groupement conjoint, vous devez préciser les prestations de chaque membre.'}
      </Alert>

      {membres.map((membre, index) => (
        <MemberCard
          key={membre.id}
          membre={membre}
          index={index}
          showPrestations={isConjoint}
          onUpdate={updateMembre}
          onRemove={removeMembre}
        />
      ))}

      <Button variant="secondary" onClick={addMembre}>
        + Ajouter un membre
      </Button>
    </section>
  );
}
