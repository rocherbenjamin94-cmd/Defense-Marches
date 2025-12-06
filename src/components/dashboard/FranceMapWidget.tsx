"use client";

import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3-geo';
import { FeatureCollection, Geometry } from 'geojson';

// --- DATA & CONFIG ---
// Coordinates for establishment markers (Long, Lat)
const markers = [
    { name: "Île-de-France (Paris)", coordinates: [2.3522, 48.8566], value: 42, type: "high" },
    { name: "Base Navale Brest", coordinates: [-4.4860, 48.3904], value: 18, type: "high" },
    { name: "Base Navale Toulon", coordinates: [5.9304, 43.1242], value: 24, type: "high" },
    { name: "Technopole Bordeaux", coordinates: [-0.5792, 44.8378], value: 12, type: "medium" },
    { name: "Lyon Defence Cluster", coordinates: [4.8357, 45.7640], value: 15, type: "medium" },
    { name: "Strasbourg Base", coordinates: [7.7521, 48.5734], value: 8, type: "low" },
    { name: "Lille Logistique", coordinates: [3.0573, 50.6292], value: 10, type: "medium" },
];

const FRANCE_GEOJSON_URL = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson";

const FranceMapWidget = () => {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);

    // Fetch GeoJSON on mount
    useEffect(() => {
        fetch(FRANCE_GEOJSON_URL)
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Failed to load map data", err));
    }, []);

    // --- PROJECTION SETUP ---
    // Use Conic Conformal projection centered on France for accurate shape
    const projection = useMemo(() => {
        return d3.geoConicConformal()
            .center([2.454071, 46.279229]) // Center of France
            .scale(2600) // Adjust scale to fit
            .translate([400, 260]); // Translate to center of SVG (800x520 approx)
    }, []);

    const pathGenerator = useMemo(() => {
        return d3.geoPath().projection(projection);
    }, [projection]);

    // Handle Dimensions (simplified for responsive SVG)
    const width = 800;
    const height = 550;

    if (!geoData) {
        return (
            <div className="w-full h-full min-h-[300px] bg-[#0F1115] flex items-center justify-center rounded-lg border border-white/5">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-500 animate-spin"></div>
                    <div className="text-xs text-slate-500 font-medium tracking-wide">Chargement de la carte...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#0F1115] relative rounded-lg overflow-hidden border border-white/5 font-sans group">

            {/* Aspect Ratio Container for Responsive SVG */}
            <div className="relative w-full pb-[68.75%]"> {/* 16:11 Aspect roughly */}
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="absolute inset-0 w-full h-full"
                    style={{ background: '#0F1115' }} // Slate-950/Black
                >
                    {/* Render Regions */}
                    <g>
                        {geoData.features.map((feature, i) => {
                            const isIDF = feature.properties?.nom === 'Île-de-France';
                            const isHovered = feature.properties?.nom === hoveredRegion;

                            return (
                                <path
                                    key={i}
                                    d={pathGenerator(feature) || ''}
                                    fill={isIDF ? "#1E293B" : "#0F172A"} // slate-800 for IDF, slate-900 for others
                                    stroke="#3b82f6" // blue-500
                                    strokeWidth={isHovered ? 2 : (isIDF ? 1.5 : 0.5)}
                                    strokeOpacity={isHovered ? 0.8 : (isIDF ? 0.5 : 0.2)}
                                    className="transition-all duration-300 ease-out cursor-pointer"
                                    style={{ outline: 'none' }}
                                    onMouseEnter={() => setHoveredRegion(feature.properties?.nom)}
                                    onMouseLeave={() => setHoveredRegion(null)}
                                />
                            );
                        })}
                    </g>

                    {/* Establishments / Markers */}
                    {markers.map((marker, i) => {
                        const [long, lat] = marker.coordinates;
                        const pos = projection([long, lat]);

                        if (!pos) return null;

                        const [x, y] = pos;
                        const isHigh = marker.type === 'high';

                        return (
                            <g
                                key={i}
                                transform={`translate(${x}, ${y})`}
                                onMouseEnter={() => setTooltip({ x, y, text: `${marker.name}: ${marker.value} marchés` })}
                                onMouseLeave={() => setTooltip(null)}
                                className="cursor-pointer"
                            >
                                {/* Glow Effect */}
                                {isHigh && (
                                    <circle r={12} fill="#06b6d4" fillOpacity={0.2} className="animate-pulse" />
                                )}
                                {/* Main Dot */}
                                <circle
                                    r={4}
                                    fill={marker.type === 'high' ? "#06b6d4" : (marker.type === 'medium' ? "#3b82f6" : "#94a3b8")}
                                    stroke="white"
                                    strokeWidth={1.5}
                                    className="filter drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]"
                                />
                            </g>
                        )
                    })}
                </svg>
            </div>

            {/* Tooltip Overlay */}
            {tooltip && (
                <div
                    className="absolute z-50 pointer-events-none px-3 py-1.5 bg-slate-800/90 backdrop-blur border border-white/10 rounded text-xs text-white shadow-xl whitespace-nowrap transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                    style={{ left: `${(tooltip.x / width) * 100}%`, top: `${(tooltip.y / height) * 100}%` }}
                >
                    {tooltip.text}
                </div>
            )}

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-40 bg-[#14181F]/90 p-3 rounded-lg border border-white/5 backdrop-blur-sm pointer-events-none">
                <div className="text-[10px] text-slate-400 font-medium mb-2">Activité Marchés</div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span> Forte
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Moyenne
                    </div>
                </div>
            </div>

        </div>
    );
};

export default FranceMapWidget;
