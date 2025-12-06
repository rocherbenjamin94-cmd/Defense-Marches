import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ScoreCompatibilite {
    scoreGenerique: number;
    niveau: 'Facile' | 'Moyen' | 'Difficile' | 'Élevé';
    resumeGenerique: string;
    pointsCles: string[];
    scorePersonnaliseDisponible: boolean;
    scorePersonnalise?: number;
    pointsForts?: string[];
    pointsVigilance?: string[];
    recommandation?: string;
    chancesDeSelecion?: string;
}

export interface AnalyseMarche {
    marcheId: string;
    acheteur: {
        nom: string;
        adresse: string;
        contact: string;
        email: string;
        telephone: string;
    };
    marche: {
        titre: string;
        objet: string;
        reference: string;
        datePublication: string;
        dateLimite: string;
        montantEstime: string | null;
    };
    lots: Array<{ numero: string; description: string }>;
    documentsRequis: string[];
    criteresSelection: Array<{ critere: string; ponderation: string }>;
    exigences?: {
        caMinimum: string | null;
        effectifMinimum: string | null;
        certifications: string[];
        references: string | null;
        zoneGeographique: string | null;
    };
    scoreCompatibilite: ScoreCompatibilite;
    prefillDC1?: {
        nomAcheteur: string;
        adresseAcheteur: string;
        objetMarche: string;
        referenceMarche: string;
        lots: Array<{ numero: string; description: string }>;
    };
    analyzedAt?: string;
}

export interface ProfilEntreprise {
    siret: string;
    raisonSociale: string;
    adresse: string;
    domainesActivite: string[];
    chiffreAffaires: string;
    effectif: string;
    certifications: string[];
    referencesMarches: string;
    zonesGeographiques: string[];
}

export async function analyserMarche(marcheId: string, boampUrl: string): Promise<AnalyseMarche> {
    const response = await axios.post(`${API_BASE_URL}/api/analyse/marche`, {
        marcheId,
        boampUrl,
    });

    if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur lors de l\'analyse');
    }

    return response.data.data;
}

export async function calculerScorePersonnalise(marcheId: string, profil: ProfilEntreprise): Promise<ScoreCompatibilite> {
    const response = await axios.post(`${API_BASE_URL}/api/analyse/score-personnalise`, {
        marcheId,
        profil,
    });

    if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur lors du calcul du score');
    }

    return response.data.data;
}

export async function getProfil(userId: string): Promise<{ exists: boolean; data: ProfilEntreprise | null }> {
    const response = await axios.get(`${API_BASE_URL}/api/profil/${userId}`);
    return response.data;
}

export async function saveProfil(userId: string, profil: ProfilEntreprise): Promise<void> {
    const response = await axios.post(`${API_BASE_URL}/api/profil`, {
        userId,
        profil,
    });

    if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur lors de la sauvegarde');
    }
}
