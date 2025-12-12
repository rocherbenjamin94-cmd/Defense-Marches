import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface CategoryCardProps {
    id: string;
    name: string;
    icon: LucideIcon;
    count: number;
}

export default function CategoryCard({ id, name, icon: Icon, count }: CategoryCardProps) {
    return (
        <Link
            href={`/category/${id}`}
            className="group flex flex-col items-center justify-center w-[140px] h-[100px] bg-[#121218] rounded-lg border border-navy-700 hover:border-gold-500/50 hover:shadow-[0_0_15px_rgba(241,196,15,0.1)] transition-all duration-300"
        >
            <Icon className="h-8 w-8 text-gray-400 group-hover:text-gold-500 transition-colors mb-2" />
            <span className="text-xs font-medium text-gray-300 group-hover:text-white text-center px-2 leading-tight">
                {name}
            </span>
        </Link>
    );
}
