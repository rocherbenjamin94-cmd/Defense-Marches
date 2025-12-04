import { Tender } from '@/lib/types';
import TenderCard from './TenderCard';

interface TenderListProps {
    tenders: Tender[];
}

export default function TenderList({ tenders }: TenderListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
            ))}
        </div>
    );
}
