import Anthropic from '@anthropic-ai/sdk';

export const documentExtractionTool: Anthropic.Tool = {
  name: 'extract_rc_data',
  description: `Extrait les informations structurées d'un document RC (Règlement de Consultation)
pour pré-remplir un formulaire DC1 de candidature aux marchés publics français.`,
  input_schema: {
    type: 'object' as const,
    properties: {
      acheteur_nom: {
        type: 'string',
        description:
          "Nom de l'acheteur/pouvoir adjudicateur (ex: Mairie de Paris, Conseil Régional Île-de-France, SNCF Réseau)",
      },
      reference_avis: {
        type: 'string',
        description:
          "Référence de l'avis de publicité (ex: BOAMP 25-12345, JOUE 2025/S 001-000123)",
      },
      reference_dossier: {
        type: 'string',
        description:
          'Référence du dossier de consultation ou numéro de procédure (ex: DCE-2025-001, MAPA-2025-123)',
      },
      objet_consultation: {
        type: 'string',
        description:
          "Objet du marché ou de l'accord-cadre (description complète)",
      },
      lots: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            numero: {
              type: 'string',
              description: 'Numéro du lot (ex: "1", "2", "A")',
            },
            intitule: {
              type: 'string',
              description: 'Intitulé/description du lot',
            },
          },
          required: ['numero', 'intitule'],
        },
        description:
          'Liste des lots si le marché est alloti. Vide si marché unique.',
      },
      date_limite_reponse: {
        type: 'string',
        description:
          'Date et heure limite de réponse/remise des offres (format: JJ/MM/AAAA HH:MM)',
      },
      criteres_selection: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Critères de sélection des candidatures et des offres mentionnés',
      },
      confidence: {
        type: 'number',
        description:
          "Niveau de confiance de l'extraction entre 0 et 100. 100 = toutes les informations clairement identifiées, 50 = informations partielles ou ambiguës, 0 = document non reconnu comme RC",
      },
    },
    required: ['confidence'],
  },
};

export interface DocumentExtractionToolInput {
  acheteur_nom?: string;
  reference_avis?: string;
  reference_dossier?: string;
  objet_consultation?: string;
  lots?: Array<{ numero: string; intitule: string }>;
  date_limite_reponse?: string;
  criteres_selection?: string[];
  confidence: number;
}
