import { Tender } from './types';

const BASE_URL = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records';

// Helper to map API record to Tender type
const mapRecordToTender = (record: any): Tender => {
    return {
        id: record.idweb || Math.random().toString(36).substr(2, 9),
        title: record.objet || 'Sans objet',
        buyer: {
            name: record.nomacheteur || 'Acheteur inconnu',
            department: Array.isArray(record.code_departement) ? record.code_departement[0] : record.code_departement,
            type: record.type_marche
        },
        publicationDate: record.dateparution || new Date().toISOString(),
        deadlineDate: record.datelimitereponse || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedAmount: 0, // Not always available in this dataset
        procedureType: record.procedure_libelle || 'Non spécifié',
        description: `Marché public de ${record.nature_libelle || 'nature inconnue'}. Famille: ${record.famille_libelle || 'Non spécifiée'}.`,
        sectors: [record.famille_libelle || 'Autre'],
        urgencyLevel: 'normal', // Calculated later
        boampUrl: record.url_avis || `https://www.boamp.fr/pages/avis/?q=idweb:"${record.idweb}"`,
        score: Math.floor(Math.random() * 20) + 80, // Mock score for now as AI scoring is complex
        cpv: record.code_cpv // Assuming code_cpv might be available or we need to extract it
    };
};

export const fetchDefenseTenders = async (): Promise<Tender[]> => {
    const whereClause = `
    (search(nomacheteur, "ministère armées") OR 
     search(nomacheteur, "gendarmerie nationale") OR 
     search(nomacheteur, "police nationale") OR
     search(nomacheteur, "direction générale armement") OR
     search(nomacheteur, "DGA") OR
     search(nomacheteur, "ministère intérieur") OR
     search(nomacheteur, "préfecture") OR
     search(objet, "défense") OR 
     search(objet, "militaire") OR
     search(objet, "sécurité") OR
     search(objet, "blindé") OR
     search(objet, "armement"))
    AND (nature = "APPEL_OFFRE" OR nature = "AVIS_MARCHE")
  `;

    const params = new URLSearchParams({
        where: whereClause,
        order_by: 'dateparution DESC',
        limit: '100',
        select: 'idweb,objet,nomacheteur,dateparution,datelimitereponse,datefindiffusion,procedure_libelle,famille_libelle,nature_libelle,code_departement,url_avis,type_marche'
    });

    try {
        const response = await fetch(`${BASE_URL}?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const tenders = data.results.map(mapRecordToTender);

        // Post-process for urgency
        const now = Date.now();
        return tenders.map((t: Tender) => {
            const deadline = new Date(t.deadlineDate).getTime();
            const daysLeft = (deadline - now) / (1000 * 60 * 60 * 24);

            let urgency: 'normal' | 'urgent' | 'critical' = 'normal';
            if (daysLeft <= 2) urgency = 'critical';
            else if (daysLeft <= 7) urgency = 'urgent';

            return { ...t, urgencyLevel: urgency };
        });

    } catch (error) {
        console.error('Error fetching BOAMP data:', error);
        throw error;
    }
};
