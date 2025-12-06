"use client";

import React, { useState } from 'react';
import franceMapData from './france-static-data.json';

// Type definitions matching the JSON structure
type MapData = {
    width: number;
    height: number;
    regions: {
        name: string;
        code: string;
        d: string;
    }[];
    markers: {
        name: string;
        coordinates: number[]; // kept for reference, not used for rendering
        value: number;
        type: string;
        x: number;
        y: number;
    }[];
};

const mapData = franceMapData as MapData;

const FranceMapWidget = () => {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);

    const { width, height, regions, markers } = mapData;

    return (
        <div className="w-full h-full bg-[#0F1115] relative rounded-lg overflow-hidden border border-white/5 font-sans group p-4 flex gap-4">

            {/* Main Map Area */}
            <div className="flex-1 relative">
                {/* Aspect Ratio Container for Responsive SVG */}
                <div className="relative w-full pb-[68.75%]"> {/* 16:11 Aspect roughly */}
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="absolute inset-0 w-full h-full"
                        style={{ background: '#0F1115' }} // Slate-950/Black
                    >
                        {/* Render Regions */}
                        <g>
                            {regions.map((region, i) => {
                                const isIDF = region.name === 'Île-de-France';
                                const isHovered = region.name === hoveredRegion;

                                return (
                                    <path
                                        key={region.code}
                                        d={region.d}
                                        fill={isIDF ? "#1E293B" : "#0F172A"} // slate-800 for IDF, slate-900 for others
                                        stroke="#3b82f6" // blue-500
                                        strokeWidth={isHovered ? 2 : (isIDF ? 1.5 : 0.5)}
                                        strokeOpacity={isHovered ? 0.8 : (isIDF ? 0.5 : 0.2)}
                                        className="transition-all duration-300 ease-out cursor-pointer"
                                        style={{ outline: 'none' }}
                                        onMouseEnter={() => setHoveredRegion(region.name)}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                    />
                                );
                            })}
                        </g>

                        {/* Establishments / Markers */}
                        {markers.map((marker, i) => {
                            const { x, y } = marker;
                            const isHigh = marker.type === 'high';
                            const radius = isHigh ? 4 : (marker.type === 'medium' ? 3 : 2);

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
                                        r={radius}
                                        fill={marker.type === 'high' ? "#06b6d4" : (marker.type === 'medium' ? "#3b82f6" : "#4b5563")}
                                        stroke="white"
                                        strokeWidth={1}
                                        className={marker.type === 'high' ? "filter drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" : ""}
                                    />
                                </g>
                            )
                        })}
                    </svg>

                    {/* Tooltip Overlay (Positioned absolutely within the SVG container) */}
                    {tooltip && (
                        <div
                            className="absolute z-50 pointer-events-none px-3 py-1.5 bg-slate-800/90 backdrop-blur border border-white/10 rounded text-xs text-white shadow-xl whitespace-nowrap transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                            style={{ left: `${(tooltip.x / width) * 100}%`, top: `${(tooltip.y / height) * 100}%` }}
                        >
                            {tooltip.text}
                        </div>
                    )}
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-0 left-0 z-40 bg-[#14181F]/90 p-3 rounded-lg border border-white/5 backdrop-blur-sm pointer-events-none">
                    <div className="text-[10px] text-slate-400 font-medium mb-2">Activité Marchés</div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span> Forte
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Moyenne
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-gray-500"></span> Faible
                        </div>
                    </div>
                </div>
            </div>

            {/* DOM-TOM Sidebar */}
            <div className="flex flex-col gap-2 w-24 shrink-0">
                <div className="bg-slate-800/50 rounded p-2 text-center border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 mb-1">Guyane</div>
                    <div className="w-8 h-6 bg-blue-900/30 rounded mx-auto relative overflow-hidden">
                        {/* Simplified shape */}
                        <div className="absolute inset-0 bg-slate-800 rotate-45 scale-150 translate-y-3 opacity-50"></div>
                        <span className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_4px_rgba(6,182,212,0.5)]"></span>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 mb-1">Martinique</div>
                    <div className="w-6 h-4 bg-blue-900/30 rounded mx-auto relative">
                        <span className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 mb-1">Guadeloupe</div>
                    <div className="w-6 h-4 bg-blue-900/30 rounded mx-auto relative">
                        <span className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 mb-1">Réunion</div>
                    <div className="w-6 h-5 bg-blue-900/30 rounded mx-auto relative">
                        <span className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_4px_rgba(6,182,212,0.5)]"></span>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 mb-1">Mayotte</div>
                    <div className="w-5 h-4 bg-blue-900/30 rounded mx-auto relative">
                        <span className="absolute w-1 h-1 bg-blue-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 mb-1">Nlle-Calédonie</div>
                    <div className="w-8 h-3 bg-blue-900/30 rounded mx-auto relative">
                        <span className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_4px_rgba(6,182,212,0.5)]"></span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default FranceMapWidget;
