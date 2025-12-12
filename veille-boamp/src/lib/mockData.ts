import { Tender, TenderStats } from './types';

export const mockTenders: Tender[] = [
    // URGENT (J-2)
    {
        id: '23-123456',
        title: 'Fourniture de gilets pare-balles et équipements tactiques',
        buyer: { name: 'Ministère de l\'Intérieur', department: 'SGAMI Sud-Est' },
        publicationDate: '2025-11-28',
        deadlineDate: '2025-12-05', // Urgent
        estimatedAmount: 1500000,
        procedureType: 'Appel d\'offres ouvert',
        description: 'Acquisition d\'équipements de protection individuelle balistique.',
        sectors: ['Sécurité', 'Équipement'],
        urgencyLevel: 'critical',
        boampUrl: 'https://boamp.fr',
        score: 95
    },
    // JUST DROPPED (Today)
    {
        id: '23-NEW001',
        title: 'Acquisition de drones de surveillance tactique',
        buyer: { name: 'DGA - Direction Générale de l\'Armement', department: 'DGA Essais de missiles' },
        publicationDate: new Date().toISOString().split('T')[0], // Today
        deadlineDate: '2026-02-01',
        estimatedAmount: 4500000,
        procedureType: 'Procédure avec négociation',
        description: 'Systèmes de drones légers pour la surveillance de zone.',
        sectors: ['Défense', 'Aérien'],
        urgencyLevel: 'normal',
        boampUrl: 'https://boamp.fr',
        score: 98
    },
    // HIGH VALUE
    {
        id: '23-HIGH001',
        title: 'Maintien en condition opérationnelle des frégates type La Fayette',
        buyer: { name: 'SSF - Service de Soutien de la Flotte', department: 'Toulon' },
        publicationDate: '2025-11-20',
        deadlineDate: '2026-01-15',
        estimatedAmount: 45000000, // High Value
        procedureType: 'Appel d\'offres restreint',
        description: 'MCO complet pour une durée de 5 ans.',
        sectors: ['Défense', 'Naval', 'Maintenance'],
        urgencyLevel: 'normal',
        boampUrl: 'https://boamp.fr',
        score: 90
    },
    // CYBER
    {
        id: '23-CYBER01',
        title: 'Audit de sécurité des systèmes d\'information classifiés',
        buyer: { name: 'SGDSN', department: 'Paris' },
        publicationDate: '2025-11-25',
        deadlineDate: '2025-12-20',
        estimatedAmount: 200000,
        procedureType: 'MAPA',
        description: 'Prestations d\'audit et de pentesting.',
        sectors: ['Cyber', 'Informatique'],
        urgencyLevel: 'normal',
        boampUrl: 'https://boamp.fr',
        score: 88
    },
    // ARMIES
    {
        id: '23-ARMY01',
        title: 'Construction d\'un bâtiment d\'hébergement pour la Légion Étrangère',
        buyer: { name: 'Ministère des Armées - ESID Lyon', department: 'Aubagne' },
        publicationDate: '2025-11-30',
        deadlineDate: '2026-03-01',
        estimatedAmount: 5000000,
        procedureType: 'Appel d\'offres ouvert',
        description: 'Travaux de gros œuvre et second œuvre.',
        sectors: ['BTP', 'Défense'],
        urgencyLevel: 'normal',
        boampUrl: 'https://boamp.fr',
        score: 85
    },
    {
        id: '23-SEC02',
        title: 'Renouvellement du parc de véhicules légers banalisés',
        buyer: { name: 'Police Nationale', department: 'Draps' },
        publicationDate: '2025-12-01',
        deadlineDate: '2026-01-10',
        estimatedAmount: 800000,
        procedureType: 'Appel d\'offres ouvert',
        description: 'Véhicules de service.',
        sectors: ['Sécurité', 'Véhicules'],
        urgencyLevel: 'normal',
        boampUrl: 'https://boamp.fr',
        score: 75
    },
];

export const mockStats: TenderStats = {
    totalTenders: 142,
    totalAmount: 125000000,
    bySector: {
        'Défense': 45,
        'Sécurité': 32,
        'Informatique': 18,
        'BTP': 27,
    },
    trend: [10, 15, 8, 12, 20, 18, 25],
};
