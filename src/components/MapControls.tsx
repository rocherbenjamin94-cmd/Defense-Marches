'use client';

import { DOMTOM_COORDS } from '@/lib/buyers';
import { MapPin, Globe } from 'lucide-react';

interface MapControlsProps {
    onLocationSelect: (center: [number, number], zoom: number) => void;
}

export default function MapControls({ onLocationSelect }: MapControlsProps) {
    return (
        <div className="absolute bottom-8 left-8 z-[400] flex flex-col gap-4 pointer-events-auto">

            {/* DOM-TOM Buttons */}
            <div className="bg-navy-800/90 backdrop-blur border border-navy-700 p-2 rounded-xl flex flex-wrap gap-2 max-w-[200px] shadow-xl">
                <div className="w-full text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">
                    Outre-mer
                </div>
                {Object.entries(DOMTOM_COORDS).map(([code, { center, zoom }]) => (
                    <button
                        key={code}
                        onClick={() => onLocationSelect(center, zoom)}
                        className="px-2 py-1 text-xs font-bold text-gray-300 bg-navy-700 hover:bg-navy-600 hover:text-white rounded transition-colors"
                    >
                        {code}
                    </button>
                ))}
            </div>

            {/* Metropole Button */}
            <button
                onClick={() => onLocationSelect([46.5, 2.5], 5.5)}
                className="flex items-center gap-2 px-4 py-3 bg-navy-800/90 backdrop-blur border border-navy-700 hover:bg-navy-700 hover:text-white text-gray-300 rounded-xl shadow-xl transition-all font-bold text-sm"
            >
                <Globe className="h-4 w-4" />
                Métropole
            </button>
        </div>
    );
}
