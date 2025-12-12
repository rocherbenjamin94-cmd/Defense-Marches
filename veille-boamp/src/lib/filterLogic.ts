import { Tender, MarketNature, AmountRange, TenderSource } from './types';

// Types de filtres pour chaque catégorie
export type EntityFilter = 'all' | 'armees' | 'terre' | 'marine' | 'air' | 'interieur' | 'dga' | 'joue' | 'cyber' | 'urgent' | 'naval' | 'aerien';
export type AmountFilter = 'all' | 'small' | 'medium' | 'large' | 'xlarge';
export type NatureFilter = 'all' | 'fournitures' | 'services' | 'travaux';
export type SourceFilter = 'all' | 'BOAMP' | 'PLACE';

// Pour compatibilité avec l'ancien code
export type FilterType = EntityFilter;

// État des filtres combinés
export interface FilterState {
    entity: EntityFilter;
    amount: AmountFilter;
    nature: NatureFilter;
    source: SourceFilter;
}

// Filtre par entité/acheteur
function filterByEntity(tenders: Tender[], filter: EntityFilter): Tender[] {
    if (filter === 'all') return tenders;

    return tenders.filter(t => {
        const buyer = t.buyer.name.toLowerCase();
        const text = (t.title + ' ' + t.description + ' ' + t.buyer.name).toLowerCase();
        // sectors[0] contient le tutelleGroupe de boamp.ts (ex: 'Terre', 'Marine', 'Air', 'DGA', etc.)
        const sector = t.sectors && t.sectors.length > 0 ? t.sectors[0].toLowerCase() : '';

        switch (filter) {
            case 'armees':
                return buyer.includes('ministère des armées') ||
                    buyer.includes('minarm') ||
                    buyer.includes('mindef') ||
                    buyer.includes('armée') ||
                    buyer.includes('marine nationale') ||
                    buyer.includes('esid') ||
                    // Tutelles défense
                    ['minarm', 'dga', 'dmaé', 'marine', 'terre', 'air', 'sca', 'sid', 'ssa', 'seo', 'simu', 'simmt', 'sga', 'enseignement'].includes(sector);

            case 'terre':
                return buyer.includes('armée de terre') ||
                    buyer.includes('simmt') ||
                    buyer.includes('smiter') ||
                    buyer.includes('bsmat') ||
                    buyer.includes('stat ') ||
                    (buyer.includes('minarm') && text.includes('terre')) ||
                    sector === 'terre' || sector === 'simmt';

            case 'marine':
                return buyer.includes('marine nationale') ||
                    buyer.includes('bcrm') ||
                    buyer.includes('shom') ||
                    buyer.includes('ssf') ||
                    text.includes('naval') ||
                    text.includes('maritime') ||
                    (t.cpv && t.cpv.startsWith('355')) ||
                    sector === 'marine';

            case 'air':
                return buyer.includes('armée de l\'air') ||
                    buyer.includes('siaé') ||
                    buyer.includes('aia ') ||
                    text.includes('aérien') ||
                    text.includes('aéronautique') ||
                    text.includes('drone') ||
                    text.includes('hélicoptère') ||
                    (t.cpv && t.cpv.startsWith('356')) ||
                    sector === 'air' || sector === 'dmaé';

            case 'interieur':
                return buyer.includes('ministère de l\'intérieur') ||
                    buyer.includes('gendarmerie') ||
                    buyer.includes('police nationale') ||
                    buyer.includes('préfecture') ||
                    buyer.includes('sgami') ||
                    buyer.includes('dggn') ||
                    buyer.includes('sailmi') ||
                    buyer.includes('dgpn') ||
                    // Tutelles intérieur
                    ['gn', 'dgpn', 'sailmi', 'satpn', 'sgami', 'autre_mi', 'gendarmerie'].includes(sector);

            case 'dga':
                return buyer.includes('direction générale de l\'armement') ||
                    buyer.includes('dga') ||
                    sector === 'dga';

            case 'joue':
                return t.isJOUE === true;

            case 'cyber':
                // Mots-clés spécifiques à la cybersécurité (éviter les faux positifs)
                return text.includes('cyber') ||
                    text.includes('sécurité informatique') ||
                    text.includes('sécurité des systèmes d\'information') ||
                    /\banssi\b/i.test(text) ||           // ANSSI en mot entier
                    /\bssi\b/i.test(text) ||             // SSI en mot entier (pas "aSSIstance")
                    text.includes('pentest') ||
                    text.includes('audit de sécurité') ||
                    text.includes('soc ') ||             // Security Operations Center
                    text.includes('intrusion') ||
                    text.includes('malware') ||
                    text.includes('cryptograph') ||
                    text.includes('chiffrement');

            case 'urgent':
                // Deadline < 7 days
                const now = Date.now();
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                const deadline = new Date(t.deadlineDate).getTime();
                return deadline - now < sevenDays && deadline > now;

            case 'naval':
                // Alias pour 'marine'
                return buyer.includes('marine nationale') ||
                    buyer.includes('bcrm') ||
                    buyer.includes('shom') ||
                    buyer.includes('ssf') ||
                    text.includes('naval') ||
                    text.includes('maritime') ||
                    (t.cpv && t.cpv.startsWith('355')) ||
                    sector === 'marine';

            case 'aerien':
                // Alias pour 'air'
                return buyer.includes('armée de l\'air') ||
                    buyer.includes('siaé') ||
                    buyer.includes('aia ') ||
                    text.includes('aérien') ||
                    text.includes('aéronautique') ||
                    text.includes('drone') ||
                    text.includes('hélicoptère') ||
                    (t.cpv && t.cpv.startsWith('356')) ||
                    sector === 'air' || sector === 'dmaé';

            default:
                return true;
        }
    });
}

// Filtre par fourchette de montant
function filterByAmount(tenders: Tender[], filter: AmountFilter): Tender[] {
    if (filter === 'all') return tenders;

    return tenders.filter(t => {
        // Si pas de fourchette connue, exclure le marché (filtrage strict)
        if (!t.amountRange) return false;
        return t.amountRange === filter;
    });
}

// Filtre par nature de marché
function filterByNature(tenders: Tender[], filter: NatureFilter): Tender[] {
    if (filter === 'all') return tenders;

    return tenders.filter(t => {
        // Si nature inconnue, exclure le marché (filtrage strict)
        if (!t.marketNature) return false;
        return t.marketNature === filter;
    });
}

// Filtre par source (BOAMP ou PLACE)
function filterBySource(tenders: Tender[], filter: SourceFilter): Tender[] {
    if (filter === 'all') return tenders;

    return tenders.filter(t => {
        // Par défaut, si pas de source définie, c'est BOAMP
        const source = t.source || 'BOAMP';
        return source === filter;
    });
}

// Fonction principale : applique tous les filtres combinés
export function filterTendersCombined(
    tenders: Tender[],
    filters: FilterState
): Tender[] {
    let result = tenders;

    result = filterByEntity(result, filters.entity);
    result = filterByAmount(result, filters.amount);
    result = filterByNature(result, filters.nature);
    result = filterBySource(result, filters.source);

    return result;
}

// Fonction legacy pour compatibilité (utilisée par l'ancien code)
export function filterTenders(tenders: Tender[], filter: FilterType): Tender[] {
    return filterByEntity(tenders, filter);
}

// Labels pour l'affichage UI
export const ENTITY_FILTER_LABELS: Record<EntityFilter, string> = {
    all: 'Tout voir',
    armees: 'Armées',
    terre: 'Armée de Terre',
    marine: 'Marine Nationale',
    naval: 'Marine Nationale',
    air: "Armée de l'Air",
    aerien: "Armée de l'Air",
    interieur: 'Intérieur',
    dga: 'DGA',
    joue: 'JOUE',
    cyber: 'Cyber',
    urgent: 'Urgent'
};

export const AMOUNT_FILTER_LABELS: Record<AmountFilter, string> = {
    all: 'Tous montants',
    small: '< 40k€',
    medium: '40-90k€',
    large: '90-221k€',
    xlarge: '> 221k€'
};

export const NATURE_FILTER_LABELS: Record<NatureFilter, string> = {
    all: 'Tous types',
    fournitures: 'Fournitures',
    services: 'Services',
    travaux: 'Travaux'
};

export const SOURCE_FILTER_LABELS: Record<SourceFilter, string> = {
    all: 'Toutes sources',
    BOAMP: 'BOAMP',
    PLACE: 'PLACE'
};

// Helper pour afficher la fourchette de montant
export function getAmountRangeLabel(range?: AmountRange): string {
    if (!range) return 'Non communiqué';
    return AMOUNT_FILTER_LABELS[range] || 'Non communiqué';
}

// Helper pour afficher la nature du marché
export function getMarketNatureLabel(nature?: MarketNature): string {
    if (!nature) return 'Non spécifié';
    const labels: Record<MarketNature, string> = {
        fournitures: 'Fournitures',
        services: 'Services',
        travaux: 'Travaux'
    };
    return labels[nature] || 'Non spécifié';
}
