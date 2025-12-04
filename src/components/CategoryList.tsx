import { Shield, Anchor, Plane, Crosshair, Cpu, Server, Wrench, Truck } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'vehicles', name: 'Véhicules & Blindés', icon: Truck, count: 12 },
    { id: 'naval', name: 'Naval', icon: Anchor, count: 8 },
    { id: 'air', name: 'Aérien & Drones', icon: Plane, count: 15 },
    { id: 'weapons', name: 'Armement', icon: Crosshair, count: 5 },
    { id: 'cyber', name: 'Cyber & IT', icon: Server, count: 24 },
    { id: 'electronics', name: 'Systèmes Élec.', icon: Cpu, count: 10 },
    { id: 'equipment', name: 'Équipement', icon: Shield, count: 18 },
    { id: 'services', name: 'MCO & Services', icon: Wrench, count: 30 },
];

export default function CategoryList() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className="group flex flex-col items-center justify-center p-6 bg-navy-800 rounded-xl border border-navy-700 hover:border-gold-500/50 hover:bg-navy-700 transition-all duration-200"
                >
                    <cat.icon className="h-8 w-8 text-navy-400 group-hover:text-gold-500 transition-colors mb-3" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">{cat.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{cat.count} marchés</span>
                </Link>
            ))}
        </div>
    );
}
