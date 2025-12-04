export interface BuyerLocation {
    id: string;
    nom: string;
    nomCourt?: string;
    famille: 'armees' | 'interieur' | 'renseignement' | 'etablissements' | 'collectivites' | 'mixte';
    parent?: string;
    adresse: string;
    departement: string;
    coordinates: [number, number]; // [lat, lng] - Leaflet uses [lat, lng], Mapbox uses [lng, lat]. Let's stick to standard [lat, lng] for Leaflet.
    website?: string;
    activeTenders: number;
    totalAmount?: number;
}

export const BUYERS_LOCATIONS: BuyerLocation[] = [
    {
        id: 'dga-tt',
        nom: 'DGA Techniques terrestres',
        nomCourt: 'DGA TT',
        famille: 'armees',
        parent: 'Ministère des Armées',
        adresse: 'Bourges',
        departement: '18',
        coordinates: [47.0810, 2.3964],
        website: 'https://www.defense.gouv.fr/dga',
        activeTenders: 7,
        totalAmount: 4200000
    },
    {
        id: 'gend-idf',
        nom: 'Région de gendarmerie Île-de-France',
        famille: 'interieur',
        parent: 'Gendarmerie nationale',
        adresse: 'Issy-les-Moulineaux',
        departement: '92',
        coordinates: [48.8247, 2.2699],
        activeTenders: 12,
        totalAmount: 1500000
    },
    {
        id: 'ssi-rennes',
        nom: 'COMCYBER / ANSSI',
        famille: 'renseignement',
        parent: 'SGDSN',
        adresse: 'Rennes',
        departement: '35',
        coordinates: [48.1173, -1.6778],
        activeTenders: 22,
        totalAmount: 8500000
    },
    {
        id: 'naval-brest',
        nom: 'Base Navale de Brest',
        famille: 'armees',
        parent: 'Marine Nationale',
        adresse: 'Brest',
        departement: '29',
        coordinates: [48.3904, -4.4861],
        activeTenders: 45,
        totalAmount: 12000000
    },
    {
        id: 'dga-ta',
        nom: 'DGA Techniques aéronautiques',
        famille: 'armees',
        parent: 'Ministère des Armées',
        adresse: 'Balma',
        departement: '31',
        coordinates: [43.6119, 1.4994],
        activeTenders: 15,
        totalAmount: 5600000
    },
    {
        id: 'cea-grenoble',
        nom: 'CEA Grenoble',
        famille: 'etablissements',
        parent: 'CEA',
        adresse: 'Grenoble',
        departement: '38',
        coordinates: [45.1667, 5.7167],
        activeTenders: 18,
        totalAmount: 9200000
    },
    {
        id: 'base-toulon',
        nom: 'Base Navale de Toulon',
        famille: 'armees',
        parent: 'Marine Nationale',
        adresse: 'Toulon',
        departement: '83',
        coordinates: [43.1242, 5.9280],
        activeTenders: 50,
        totalAmount: 25000000
    },
    {
        id: 'dga-mi',
        nom: 'DGA Maîtrise de l\'Information',
        famille: 'armees',
        parent: 'Ministère des Armées',
        adresse: 'Bruz',
        departement: '35',
        coordinates: [48.0153, -1.7450],
        activeTenders: 28,
        totalAmount: 11000000
    },
    {
        id: 'base-istres',
        nom: 'Base Aérienne 125 Istres',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Istres',
        departement: '13',
        coordinates: [43.5136, 4.9236],
        activeTenders: 14,
        totalAmount: 3800000
    },
    {
        id: 'onera-palaiseau',
        nom: 'ONERA Palaiseau',
        famille: 'etablissements',
        parent: 'ONERA',
        adresse: 'Palaiseau',
        departement: '91',
        coordinates: [48.7136, 2.2356],
        activeTenders: 9,
        totalAmount: 2100000
    },
    {
        id: 'sae-lille',
        nom: 'SGAMI Nord',
        famille: 'interieur',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Lille',
        departement: '59',
        coordinates: [50.6292, 3.0573],
        activeTenders: 25,
        totalAmount: 4500000
    },
    {
        id: 'sae-metz',
        nom: 'SGAMI Est',
        famille: 'interieur',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Metz',
        departement: '57',
        coordinates: [49.1193, 6.1757],
        activeTenders: 14,
        totalAmount: 2800000
    },
    {
        id: 'sae-bordeaux',
        nom: 'SGAMI Sud-Ouest',
        famille: 'interieur',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Bordeaux',
        departement: '33',
        coordinates: [44.8378, -0.5792],
        activeTenders: 20,
        totalAmount: 3200000
    },
    {
        id: 'sae-marseille',
        nom: 'SGAMI Sud',
        famille: 'interieur',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Marseille',
        departement: '13',
        coordinates: [43.2965, 5.3698],
        activeTenders: 18,
        totalAmount: 3500000
    },
    {
        id: 'sae-lyon',
        nom: 'SGAMI Sud-Est',
        famille: 'interieur',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Lyon',
        departement: '69',
        coordinates: [45.7640, 4.8357],
        activeTenders: 22,
        totalAmount: 4100000
    },
    {
        id: 'sae-rennes',
        nom: 'SGAMI Ouest',
        famille: 'interieur',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Rennes',
        departement: '35',
        coordinates: [48.1173, -1.6778],
        activeTenders: 16,
        totalAmount: 2900000
    },
    {
        id: 'cnes-toulouse',
        nom: 'CNES Toulouse',
        famille: 'etablissements',
        parent: 'CNES',
        adresse: 'Toulouse',
        departement: '31',
        coordinates: [43.5606, 1.4808],
        activeTenders: 8,
        totalAmount: 15000000
    },
    {
        id: 'base-cazaux',
        nom: 'Base Aérienne 120 Cazaux',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'La Teste-de-Buch',
        departement: '33',
        coordinates: [44.5264, -1.1264],
        activeTenders: 6,
        totalAmount: 1200000
    },
    {
        id: 'base-mont-de-marsan',
        nom: 'Base Aérienne 118 Mont-de-Marsan',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Mont-de-Marsan',
        departement: '40',
        coordinates: [43.9117, -0.5028],
        activeTenders: 11,
        totalAmount: 2300000
    },
    {
        id: 'base-avord',
        nom: 'Base Aérienne 702 Avord',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Avord',
        departement: '18',
        coordinates: [47.0433, 2.6367],
        activeTenders: 5,
        totalAmount: 900000
    },
    {
        id: 'base-evreux',
        nom: 'Base Aérienne 105 Évreux',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Évreux',
        departement: '27',
        coordinates: [49.0233, 1.2206],
        activeTenders: 8,
        totalAmount: 1400000
    },
    {
        id: 'base-orleans',
        nom: 'Base Aérienne 123 Orléans-Bricy',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Bricy',
        departement: '45',
        coordinates: [47.9878, 1.7606],
        activeTenders: 12,
        totalAmount: 2800000
    },
    {
        id: 'base-nancy',
        nom: 'Base Aérienne 133 Nancy-Ochey',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Ochey',
        departement: '54',
        coordinates: [48.5831, 5.9556],
        activeTenders: 7,
        totalAmount: 1100000
    },
    {
        id: 'base-saint-dizier',
        nom: 'Base Aérienne 113 Saint-Dizier',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Saint-Dizier',
        departement: '52',
        coordinates: [48.6333, 4.9000],
        activeTenders: 9,
        totalAmount: 1600000
    },
    {
        id: 'base-luxeuil',
        nom: 'Base Aérienne 116 Luxeuil',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Luxeuil-les-Bains',
        departement: '70',
        coordinates: [47.7833, 6.3667],
        activeTenders: 5,
        totalAmount: 800000
    },
    {
        id: 'base-orange',
        nom: 'Base Aérienne 115 Orange',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Orange',
        departement: '84',
        coordinates: [44.1381, 4.8561],
        activeTenders: 6,
        totalAmount: 950000
    },
    {
        id: 'base-solenzara',
        nom: 'Base Aérienne 126 Solenzara',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Ventiseri',
        departement: '2B',
        coordinates: [41.9239, 9.4000],
        activeTenders: 4,
        totalAmount: 600000
    },
    {
        id: 'base-cognac',
        nom: 'Base Aérienne 709 Cognac',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Châteaubernard',
        departement: '16',
        coordinates: [45.6583, -0.3194],
        activeTenders: 8,
        totalAmount: 1300000
    },
    {
        id: 'base-tours',
        nom: 'Base Aérienne 705 Tours',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Tours',
        departement: '37',
        coordinates: [47.4333, 0.7167],
        activeTenders: 6,
        totalAmount: 1000000
    },
    {
        id: 'base-salon',
        nom: 'Base Aérienne 701 Salon-de-Provence',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Salon-de-Provence',
        departement: '13',
        coordinates: [43.6050, 5.1067],
        activeTenders: 10,
        totalAmount: 1800000
    },
    {
        id: 'base-rochefort',
        nom: 'Base Aérienne 721 Rochefort',
        famille: 'armees',
        parent: 'Armée de l\'Air',
        adresse: 'Rochefort',
        departement: '17',
        coordinates: [45.9333, -0.9833],
        activeTenders: 7,
        totalAmount: 1100000
    },
    {
        id: 'balard',
        nom: 'Hexagone Balard',
        famille: 'armees',
        parent: 'Ministère des Armées',
        adresse: 'Paris',
        departement: '75',
        coordinates: [48.8356, 2.2764],
        activeTenders: 120,
        totalAmount: 150000000
    },
    {
        id: 'dgsi-levallois',
        nom: 'DGSI',
        famille: 'renseignement',
        parent: 'Ministère de l\'Intérieur',
        adresse: 'Levallois-Perret',
        departement: '92',
        coordinates: [48.8932, 2.2879],
        activeTenders: 35,
        totalAmount: 18000000
    },
    {
        id: 'dgse-paris',
        nom: 'DGSE',
        famille: 'renseignement',
        parent: 'Ministère des Armées',
        adresse: 'Paris',
        departement: '75',
        coordinates: [48.8744, 2.4075],
        activeTenders: 42,
        totalAmount: 25000000
    },
    {
        id: 'drm-creil',
        nom: 'DRM Creil',
        famille: 'renseignement',
        parent: 'Ministère des Armées',
        adresse: 'Creil',
        departement: '60',
        coordinates: [49.2556, 2.5111],
        activeTenders: 12,
        totalAmount: 4500000
    }
];

export const DOMTOM_COORDS: Record<string, { center: [number, number], zoom: number }> = {
    'GP': { center: [16.25, -61.55], zoom: 9 },   // Guadeloupe
    'MQ': { center: [14.64, -61.02], zoom: 10 },  // Martinique
    'GF': { center: [3.93, -53.13], zoom: 6 },    // Guyane
    'RE': { center: [-21.13, 55.53], zoom: 9 },   // Réunion
    'YT': { center: [-12.84, 45.16], zoom: 10 },  // Mayotte
    'NC': { center: [-21.29, 165.62], zoom: 7 },  // Nouvelle-Calédonie
    'PF': { center: [-17.53, -149.56], zoom: 7 }, // Polynésie
};
