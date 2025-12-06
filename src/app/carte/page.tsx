'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
// Navbar imported in distinct component but removed here to avoid duplication with layout
import MapFilters from '@/components/MapFilters';
import BuyerPanel from '@/components/BuyerPanel';
import MapControls from '@/components/MapControls';
import { BuyerLocation } from '@/lib/buyers';

// Dynamically import Map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#0B0D11] text-slate-500">
            Chargement de la carte...
        </div>
    ),
});

export default function MapPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedBuyer, setSelectedBuyer] = useState<BuyerLocation | null>(null);
    const [mapView, setMapView] = useState<{ center: [number, number], zoom: number }>({
        center: [46.5, 2.5],
        zoom: 5.5
    });

    const handleLocationSelect = (center: [number, number], zoom: number) => {
        setMapView({ center, zoom });
    };

    return (
        <div className="min-h-screen bg-[#0B0D11] text-gray-100 font-sans selection:bg-blue-900/50 selection:text-blue-200">
            {/* Navbar handled by layout.tsx */}

            <main className="pt-[70px] h-screen flex flex-col relative overflow-hidden">
                {/* Sticky Filters */}
                <div className="sticky top-[70px] z-40 bg-[#0B0D11]/95 backdrop-blur border-b border-white/5 shadow-lg">
                    <MapFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>

                {/* Map Container */}
                <div className="flex-1 relative z-0">
                    <InteractiveMap
                        activeFilter={activeFilter}
                        onBuyerSelect={setSelectedBuyer}
                        mapCenter={mapView.center}
                        mapZoom={mapView.zoom}
                    />

                    {/* Controls Overlay */}
                    <MapControls onLocationSelect={handleLocationSelect} />
                </div>

                {/* Slide-in Panel */}
                <BuyerPanel
                    buyer={selectedBuyer}
                    onClose={() => setSelectedBuyer(null)}
                />
            </main>
        </div>
    );
}
