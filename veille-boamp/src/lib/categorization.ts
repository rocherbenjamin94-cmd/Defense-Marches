import { Tender } from './types';

export const categorizeTenders = (tenders: Tender[]) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
        urgents: tenders.filter(t => {
            const deadline = new Date(t.deadlineDate);
            return deadline > now && deadline <= sevenDaysFromNow;
        }).sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()),

        justDropped: tenders.filter(t => t.publicationDate.startsWith(today))
            .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()),

        highValue: tenders.filter(t => (t.estimatedAmount && t.estimatedAmount > 1000000) || t.procedureType.includes('JOUE')),

        ministryArmies: tenders.filter(t => {
            const buyer = t.buyer.name.toLowerCase();
            return buyer.includes('ministère des armées') || buyer.includes('dga') || buyer.includes('économat');
        }),

        interiorSecurity: tenders.filter(t => {
            const buyer = t.buyer.name.toLowerCase();
            return buyer.includes('intérieur') || buyer.includes('gendarmerie') || buyer.includes('police') || buyer.includes('préfecture');
        }),

        cyber: tenders.filter(t => {
            const text = (t.title + t.description).toLowerCase();
            return text.includes('cyber') || text.includes('ssi') || text.includes('renseignement') || text.includes('anssi');
        }),
    };
};
