"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
// Leaflet's default icon paths are tricky with webpack/next
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// Custom DivIcon for the modern glowing dots
const createCustomIcon = (type: 'high' | 'medium' | 'low') => {
    let colorClass = 'bg-cyan-400';
    if (type === 'medium') colorClass = 'bg-blue-500';
    if (type === 'low') colorClass = 'bg-slate-400';

    // We can't use Tailwind classes inside L.divIcon html string easily if they are not global or compiled? 
    // Actually we can pass className to DivIcon.
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="relative flex items-center justify-center w-4 h-4">
                 ${type === 'high' ? `<span class="absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75 animate-ping"></span>` : ''}
                 <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${colorClass} border border-white shadow-sm"></span>
               </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
};

const markers = [
    { name: "Île-de-France (Paris)", coordinates: [48.8566, 2.3522], value: 42, type: "high" },
    { name: "Base Navale Brest", coordinates: [48.3904, -4.4860], value: 18, type: "high" },
    { name: "Base Navale Toulon", coordinates: [43.1242, 5.9304], value: 24, type: "high" },
    { name: "Technopole Bordeaux", coordinates: [44.8378, -0.5792], value: 12, type: "medium" },
    { name: "Lyon Defence Cluster", coordinates: [45.7640, 4.8357], value: 15, type: "medium" },
    { name: "Strasbourg Base", coordinates: [48.5734, 7.7521], value: 8, type: "low" },
    { name: "Lille Logistique", coordinates: [50.6292, 3.0573], value: 10, type: "medium" },
];

const FranceMap = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        // Fetch France Regions GeoJSON
        fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson')
            .then(res => res.json())
            .then(data => setGeoJsonData(data))
            .catch(err => console.error("Error loading France GeoJSON:", err));
    }, []);

    const regionStyle = (feature: any) => {
        const isIDF = feature?.properties?.nom === 'Île-de-France';
        return {
            fillColor: isIDF ? '#1E293B' : '#0F172A', // Lighter for IDF
            weight: 1,
            opacity: 1,
            color: 'rgba(59, 130, 246, 0.3)', // blue-500/30
            fillOpacity: isIDF ? 0.6 : 0.4,
        };
    };

    const onEachRegion = (feature: any, layer: L.Layer) => {
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.7,
                    weight: 2,
                    color: '#60A5FA' // blue-400
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                // create a simple reset - in real app might need to check if IDF to simpler styling
                const isIDF = feature?.properties?.nom === 'Île-de-France';
                layer.setStyle({
                    fillColor: isIDF ? '#1E293B' : '#0F172A',
                    weight: 1,
                    color: 'rgba(59, 130, 246, 0.3)',
                    fillOpacity: isIDF ? 0.6 : 0.4,
                });
            },
        });
        if (feature.properties && feature.properties.nom) {
            // Simple tooltip for region name if needed
            // layer.bindTooltip(feature.properties.nom);
        }
    };

    return (
        <div className="w-full h-full min-h-[350px] bg-[#0F1115] relative rounded-lg overflow-hidden z-0">
            <MapContainer
                center={[46.603354, 1.888334]}
                zoom={5}
                scrollWheelZoom={false}
                className="w-full h-full z-0"
                style={{ background: '#0F1115' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {geoJsonData && (
                    <GeoJSON
                        data={geoJsonData}
                        style={regionStyle}
                        onEachFeature={onEachRegion}
                    />
                )}

                {markers.map((marker, idx) => (
                    <Marker
                        key={idx}
                        position={marker.coordinates as [number, number]}
                        icon={createCustomIcon(marker.type as any)}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <h3 className="font-bold text-slate-800 text-xs">{marker.name}</h3>
                                <p className="text-slate-600 text-[10px]">{marker.value} marchés actifs</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[400] bg-[#14181F]/90 p-3 rounded-lg border border-white/5 backdrop-blur-sm shadow-xl pointer-events-none">
                <div className="text-[10px] text-slate-400 font-medium mb-2">Densité Marchés</div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span> Forte (&gt;15)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Moyenne (10-15)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span> Faible (&lt;10)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranceMap;
