'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BUYERS_LOCATIONS, BuyerLocation } from '@/lib/buyers';
import clsx from 'clsx';
import { Shield, Building2, Eye, AlertCircle } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
    activeFilter: string;
    onBuyerSelect: (buyer: BuyerLocation) => void;
    mapCenter?: [number, number];
    mapZoom?: number;
}

const PIN_COLORS = {
    armees: '#3b82f6',      // Bleu
    interieur: '#ef4444',   // Rouge  
    renseignement: '#eab308', // Jaune
    etablissements: '#22c55e', // Vert
    collectivites: '#a855f7',  // Violet
    mixte: '#6b7280',       // Gris
};

// Custom Hook to update map view
function MapUpdater({ center, zoom }: { center?: [number, number], zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        if (center && zoom) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

export default function InteractiveMap({ activeFilter, onBuyerSelect, mapCenter, mapZoom }: InteractiveMapProps) {

    // Create custom icons based on buyer type and size
    const createCustomIcon = (buyer: BuyerLocation) => {
        const color = PIN_COLORS[buyer.famille] || PIN_COLORS.mixte;
        let size = 12;
        if (buyer.activeTenders >= 10) size = 24;
        else if (buyer.activeTenders >= 6) size = 20;
        else if (buyer.activeTenders >= 3) size = 16;

        const isLarge = buyer.activeTenders >= 10;

        return L.divIcon({
            className: 'custom-pin',
            html: `
                <div style="
                    background-color: ${color};
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 10px ${color}80;
                    ${isLarge ? 'animation: pulse 2s infinite;' : ''}
                "></div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    const filteredBuyers = BUYERS_LOCATIONS.filter(buyer =>
        activeFilter === 'all' || buyer.famille === activeFilter
    );

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0">
            <style jsx global>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }
                .leaflet-popup-content-wrapper {
                    background: #14181F;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                }
                .leaflet-popup-tip {
                    background: #14181F;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>

            <MapContainer
                center={[46.5, 2.5]}
                zoom={5.5}
                className="w-full h-full bg-[#0B0D11]"
                minZoom={4}
                maxZoom={15}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={mapCenter} zoom={mapZoom} />

                {filteredBuyers.map((buyer) => (
                    <Marker
                        key={buyer.id}
                        position={buyer.coordinates}
                        icon={createCustomIcon(buyer)}
                        eventHandlers={{
                            click: () => onBuyerSelect(buyer),
                        }}
                    >
                        <Popup closeButton={false} offset={[0, -10]}>
                            <div className="p-1 min-w-[150px]">
                                <h3 className="font-bold text-sm mb-1">{buyer.nomCourt || buyer.nom}</h3>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                    <span className="truncate">📍 {buyer.adresse} ({buyer.departement})</span>
                                </div>
                                <div className="text-xs font-medium text-blue-400">
                                    📋 {buyer.activeTenders} marchés actifs
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
