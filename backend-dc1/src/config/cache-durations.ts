export const CACHE_DURATIONS = {
    // Claude - analyses de documents
    documentAnalysis: 6 * 30 * 24 * 60 * 60 * 1000, // 6 mois (même doc = même analyse)

    // Pappers - selon l'usage
    pappers: {
        // Pour simple affichage / consultation
        info: 6 * 30 * 24 * 60 * 60 * 1000, // 6 mois

        // Pour génération DC1/DC2 (candidature réelle)
        // Données critiques : statut entreprise, procédures collectives
        candidature: 30 * 24 * 60 * 60 * 1000, // 1 mois

        // Recherches par nom d'entreprise
        search: 3 * 30 * 24 * 60 * 60 * 1000, // 3 mois
    },

    // BOAMP - marchés
    marches: 24 * 60 * 60 * 1000, // 24h (mis à jour 2x/jour par BOAMP)
};
