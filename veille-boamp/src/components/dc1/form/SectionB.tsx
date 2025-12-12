import { Textarea } from '@/components/dc1/common';
import { useFormData } from '@/hooks/dc1';
import { dc1HelpTexts } from '@/lib/dc1/data/helpTexts';

export function SectionB() {
  const { formData, updateConsultation } = useFormData();

  return (
    <section className="section">
      <h2 className="section-title">B - Objet de la consultation</h2>

      <Textarea
        label="Objet du marché / de l'accord-cadre *"
        value={formData.consultation.objet}
        onChange={(e) => updateConsultation({ objet: e.target.value })}
        placeholder="Décrivez l'objet du marché ou de l'accord-cadre..."
        helpText={dc1HelpTexts.consultation.objet}
        required
      />
    </section>
  );
}
