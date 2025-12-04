import { Tender } from './types';

export type FilterType = 'all' | 'urgent' | 'armees' | 'interieur' | 'dga' | 'cyber' | 'naval' | 'aerien';

export function filterTenders(tenders: Tender[], filter: FilterType): Tender[] {
    switch (filter) {
        case 'all':
            return tenders;

        case 'urgent':
            // Deadline < 7 days
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            return tenders.filter(t => {
                const deadline = new Date(t.deadlineDate).getTime();
                return deadline - now < sevenDays && deadline > now;
            });

        case 'armees':
            return tenders.filter(t => {
                const buyer = t.buyer.name.toLowerCase();
                return buyer.includes('ministère des armées') ||
                    buyer.includes('armée de terre') ||
                    buyer.includes('marine nationale') ||
                    buyer.includes('armée de l\'air');
            });

        case 'interieur':
            return tenders.filter(t => {
                const buyer = t.buyer.name.toLowerCase();
                return buyer.includes('ministère de l\'intérieur') ||
                    buyer.includes('gendarmerie') ||
                    buyer.includes('police nationale') ||
                    buyer.includes('préfecture');
            });

        case 'dga':
            return tenders.filter(t => {
                const buyer = t.buyer.name.toLowerCase();
                return buyer.includes('direction générale de l\'armement') ||
                    buyer.includes('dga');
            });

        case 'cyber':
            return tenders.filter(t => {
                const text = (t.title + ' ' + t.description + ' ' + t.buyer.name).toLowerCase();
                return text.includes('cyber') ||
                    text.includes('sécurité informatique') ||
                    text.includes('ssi') ||
                    text.includes('anssi');
            });

        case 'naval':
            return tenders.filter(t => {
                const text = (t.title + ' ' + t.description).toLowerCase();
                return text.includes('naval') ||
                    text.includes('maritime') ||
                    text.includes('marine') ||
                    (t.cpv && t.cpv.startsWith('355'));
            });

        case 'aerien':
            return tenders.filter(t => {
                const text = (t.title + ' ' + t.description).toLowerCase();
                return text.includes('aérien') ||
                    text.includes('aéronautique') ||
                    text.includes('drone') ||
                    text.includes('hélicoptère') ||
                    (t.cpv && t.cpv.startsWith('356'));
            });

        default:
            return tenders;
    }
}
