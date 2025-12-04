import Anthropic from '@anthropic-ai/sdk';

export const pappersLookupTool: Anthropic.Tool = {
  name: 'pappers_lookup',
  description:
    "Recherche les informations d'une entreprise française via l'API Pappers. Peut rechercher par SIRET (14 chiffres), SIREN (9 chiffres) ou par nom d'entreprise.",
  input_schema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: "SIRET (14 chiffres), SIREN (9 chiffres) ou nom de l'entreprise",
      },
      query_type: {
        type: 'string',
        enum: ['siret', 'siren', 'nom'],
        description: 'Type de recherche',
      },
    },
    required: ['query', 'query_type'],
  },
};

export interface PappersToolInput {
  query: string;
  query_type: 'siret' | 'siren' | 'nom';
}
