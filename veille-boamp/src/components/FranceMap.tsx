'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Building2, Shield, Eye, AlertCircle } from 'lucide-react';

interface FranceMapProps {
    activeFilter: string;
}

// Simplified Grid Layout for France Departments (Cartogram)
// x: col, y: row
const DEPARTMENTS = [
    // Row 1 (North)
    { id: '62', name: 'Pas-de-Calais', x: 6, y: 1, type: 'interieur', count: 12 },
    { id: '59', name: 'Nord', x: 7, y: 1, type: 'armees', count: 25 },

    // Row 2
    { id: '80', name: 'Somme', x: 6, y: 2, type: 'mixte', count: 5 },
    { id: '02', name: 'Aisne', x: 7, y: 2, type: 'interieur', count: 8 },
    { id: '08', name: 'Ardennes', x: 8, y: 2, type: 'armees', count: 4 },

    // Row 3 (Normandy / East)
    { id: '50', name: 'Manche', x: 3, y: 3, type: 'armees', count: 18 }, // Naval Group
    { id: '14', name: 'Calvados', x: 4, y: 3, type: 'interieur', count: 10 },
    { id: '76', name: 'Seine-Maritime', x: 5, y: 3, type: 'mixte', count: 7 },
    { id: '60', name: 'Oise', x: 6, y: 3, type: 'armees', count: 15 }, // Creil
    { id: '51', name: 'Marne', x: 8, y: 3, type: 'armees', count: 12 },
    { id: '55', name: 'Meuse', x: 9, y: 3, type: 'armees', count: 6 },
    { id: '54', name: 'Meurthe-et-Moselle', x: 10, y: 3, type: 'armees', count: 9 },
    { id: '57', name: 'Moselle', x: 11, y: 3, type: 'armees', count: 14 },
    { id: '67', name: 'Bas-Rhin', x: 12, y: 3, type: 'renseignement', count: 8 },

    // Row 4 (Brittany / Paris / East)
    { id: '29', name: 'Finistère', x: 1, y: 4, type: 'armees', count: 45 }, // Brest
    { id: '22', name: 'Côtes-d\'Armor', x: 2, y: 4, type: 'mixte', count: 5 },
    { id: '35', name: 'Ille-et-Vilaine', x: 3, y: 4, type: 'renseignement', count: 22 }, // Bruz
    { id: '53', name: 'Mayenne', x: 4, y: 4, type: 'mixte', count: 3 },
    { id: '72', name: 'Sarthe', x: 5, y: 4, type: 'armees', count: 8 },
    { id: '28', name: 'Eure-et-Loir', x: 6, y: 4, type: 'mixte', count: 4 },
    { id: '75', name: 'Paris', x: 7, y: 4, type: 'armees', count: 120 }, // Balard
    { id: '77', name: 'Seine-et-Marne', x: 8, y: 4, type: 'interieur', count: 15 },
    { id: '10', name: 'Aube', x: 9, y: 4, type: 'mixte', count: 2 },
    { id: '52', name: 'Haute-Marne', x: 10, y: 4, type: 'armees', count: 5 },
    { id: '88', name: 'Vosges', x: 11, y: 4, type: 'mixte', count: 3 },
    { id: '68', name: 'Haut-Rhin', x: 12, y: 4, type: 'armees', count: 7 },

    // Row 5 (Central West / Center / East)
    { id: '56', name: 'Morbihan', x: 2, y: 5, type: 'armees', count: 20 }, // Lorient
    { id: '44', name: 'Loire-Atlantique', x: 3, y: 5, type: 'etablissements', count: 12 },
    { id: '49', name: 'Maine-et-Loire', x: 4, y: 5, type: 'armees', count: 10 },
    { id: '37', name: 'Indre-et-Loire', x: 5, y: 5, type: 'armees', count: 14 },
    { id: '41', name: 'Loir-et-Cher', x: 6, y: 5, type: 'armees', count: 6 }, // Romorantin
    { id: '45', name: 'Loiret', x: 7, y: 5, type: 'armees', count: 18 }, // Orléans
    { id: '89', name: 'Yonne', x: 8, y: 5, type: 'mixte', count: 4 },
    { id: '21', name: 'Côte-d\'Or', x: 9, y: 5, type: 'interieur', count: 8 },
    { id: '70', name: 'Haute-Saône', x: 10, y: 5, type: 'armees', count: 3 }, // Luxeuil
    { id: '90', name: 'Territoire de Belfort', x: 11, y: 5, type: 'armees', count: 5 },

    // Row 6 (West / Center)
    { id: '85', name: 'Vendée', x: 3, y: 6, type: 'mixte', count: 6 },
    { id: '79', name: 'Deux-Sèvres', x: 4, y: 6, type: 'mixte', count: 3 },
    { id: '86', name: 'Vienne', x: 5, y: 6, type: 'interieur', count: 7 },
    { id: '36', name: 'Indre', x: 6, y: 6, type: 'mixte', count: 4 },
    { id: '18', name: 'Cher', x: 7, y: 6, type: 'armees', count: 25 }, // Bourges
    { id: '58', name: 'Nièvre', x: 8, y: 6, type: 'mixte', count: 2 },
    { id: '71', name: 'Saône-et-Loire', x: 9, y: 6, type: 'mixte', count: 5 },
    { id: '39', name: 'Jura', x: 10, y: 6, type: 'interieur', count: 4 },

    // Row 7 (South West / Center / Alps)
    { id: '17', name: 'Charente-Maritime', x: 3, y: 7, type: 'armees', count: 16 }, // Rochefort
    { id: '16', name: 'Charente', x: 4, y: 7, type: 'armees', count: 8 },
    { id: '87', name: 'Haute-Vienne', x: 5, y: 7, type: 'interieur', count: 9 },
    { id: '23', name: 'Creuse', x: 6, y: 7, type: 'mixte', count: 1 },
    { id: '03', name: 'Allier', x: 7, y: 7, type: 'armees', count: 6 },
    { id: '63', name: 'Puy-de-Dôme', x: 8, y: 7, type: 'armees', count: 12 }, // Clermont
    { id: '42', name: 'Loire', x: 9, y: 7, type: 'etablissements', count: 10 },
    { id: '69', name: 'Rhône', x: 10, y: 7, type: 'armees', count: 30 }, // Lyon
    { id: '01', name: 'Ain', x: 11, y: 7, type: 'interieur', count: 6 },
    { id: '74', name: 'Haute-Savoie', x: 12, y: 7, type: 'interieur', count: 8 },

    // Row 8 (South West)
    { id: '33', name: 'Gironde', x: 3, y: 8, type: 'armees', count: 40 }, // Bordeaux
    { id: '24', name: 'Dordogne', x: 4, y: 8, type: 'interieur', count: 5 }, // Périgueux
    { id: '19', name: 'Corrèze', x: 5, y: 8, type: 'armees', count: 7 }, // Tulle
    { id: '15', name: 'Cantal', x: 6, y: 8, type: 'mixte', count: 2 },
    { id: '43', name: 'Haute-Loire', x: 7, y: 8, type: 'mixte', count: 2 },
    { id: '07', name: 'Ardèche', x: 9, y: 8, type: 'mixte', count: 3 },
    { id: '26', name: 'Drôme', x: 10, y: 8, type: 'armees', count: 8 },
    { id: '38', name: 'Isère', x: 11, y: 8, type: 'interieur', count: 15 },
    { id: '73', name: 'Savoie', x: 12, y: 8, type: 'armees', count: 10 },

    // Row 9 (South West)
    { id: '40', name: 'Landes', x: 3, y: 9, type: 'armees', count: 18 }, // Mont-de-Marsan
    { id: '47', name: 'Lot-et-Garonne', x: 4, y: 9, type: 'interieur', count: 6 },
    { id: '46', name: 'Lot', x: 5, y: 9, type: 'armees', count: 4 },
    { id: '12', name: 'Aveyron', x: 6, y: 9, type: 'armees', count: 5 }, // Larzac
    { id: '48', name: 'Lozère', x: 7, y: 9, type: 'mixte', count: 1 },
    { id: '30', name: 'Gard', x: 8, y: 9, type: 'armees', count: 14 }, // Nîmes
    { id: '84', name: 'Vaucluse', x: 9, y: 9, type: 'armees', count: 12 }, // Orange
    { id: '04', name: 'Alpes-de-Haute-Provence', x: 10, y: 9, type: 'mixte', count: 4 },
    { id: '05', name: 'Hautes-Alpes', x: 11, y: 9, type: 'armees', count: 6 },

    // Row 10 (South)
    { id: '64', name: 'Pyrénées-Atlantiques', x: 3, y: 10, type: 'armees', count: 15 }, // Pau
    { id: '32', name: 'Gers', x: 4, y: 10, type: 'mixte', count: 3 },
    { id: '82', name: 'Tarn-et-Garonne', x: 5, y: 10, type: 'armees', count: 8 }, // Montauban
    { id: '81', name: 'Tarn', x: 6, y: 10, type: 'armees', count: 10 }, // Castres
    { id: '34', name: 'Hérault', x: 7, y: 10, type: 'interieur', count: 12 },
    { id: '13', name: 'Bouches-du-Rhône', x: 9, y: 10, type: 'armees', count: 35 }, // Marseille/Istres
    { id: '83', name: 'Var', x: 10, y: 10, type: 'armees', count: 50 }, // Toulon
    { id: '06', name: 'Alpes-Maritimes', x: 11, y: 10, type: 'interieur', count: 18 },

    // Row 11 (Pyrenees)
    { id: '65', name: 'Hautes-Pyrénées', x: 4, y: 11, type: 'armees', count: 10 }, // Tarbes
    { id: '31', name: 'Haute-Garonne', x: 5, y: 11, type: 'etablissements', count: 28 }, // Toulouse
    { id: '09', name: 'Ariège', x: 6, y: 11, type: 'armees', count: 4 },
    { id: '11', name: 'Aude', x: 7, y: 11, type: 'armees', count: 8 },
    { id: '66', name: 'Pyrénées-Orientales', x: 8, y: 11, type: 'interieur', count: 7 },

    // Corsica
    { id: '2A', name: 'Corse-du-Sud', x: 12, y: 11, type: 'armees', count: 6 },
    { id: '2B', name: 'Haute-Corse', x: 12, y: 10, type: 'armees', count: 8 }, // Solenzara
];

export default function FranceMap({ activeFilter }: FranceMapProps) {
    const [hoveredDept, setHoveredDept] = useState<string | null>(null);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Grid Container */}
            <div className="relative p-4 bg-[#121218] rounded-3xl border border-navy-700 shadow-2xl">
                {/* CSS Grid for Departments */}
                <div className="grid grid-cols-[repeat(13,minmax(30px,40px))] grid-rows-[repeat(12,minmax(30px,40px))] gap-1.5">
                    {DEPARTMENTS.map((dept) => {
                        const isHovered = hoveredDept === dept.id;

                        // Determine Color based on Type and Count
                        let baseColor = 'bg-gray-700';
                        let textColor = 'text-gray-400';

                        if (activeFilter === 'all' || activeFilter === dept.type) {
                            if (dept.type === 'armees') { baseColor = 'bg-blue-600'; textColor = 'text-blue-100'; }
                            if (dept.type === 'interieur') { baseColor = 'bg-red-600'; textColor = 'text-red-100'; }
                            if (dept.type === 'renseignement') { baseColor = 'bg-yellow-600'; textColor = 'text-yellow-100'; }
                            if (dept.type === 'etablissements') { baseColor = 'bg-green-600'; textColor = 'text-green-100'; }
                            if (dept.type === 'mixte') { baseColor = 'bg-gray-600'; textColor = 'text-gray-200'; }
                        } else {
                            // Dimmed if not active filter
                            baseColor = 'bg-navy-800';
                            textColor = 'text-navy-600';
                        }

                        // Opacity based on count (simplified)
                        const opacity = dept.count > 20 ? 'opacity-100' : dept.count > 10 ? 'opacity-80' : 'opacity-60';

                        return (
                            <div
                                key={dept.id}
                                style={{ gridColumn: dept.x, gridRow: dept.y }}
                                className={clsx(
                                    "relative rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:z-10 hover:scale-125 hover:shadow-lg",
                                    baseColor,
                                    activeFilter === 'all' || activeFilter === dept.type ? opacity : 'opacity-30 grayscale'
                                )}
                                onMouseEnter={() => setHoveredDept(dept.id)}
                                onMouseLeave={() => setHoveredDept(null)}
                            >
                                <span className={clsx("text-[10px] font-bold", textColor)}>
                                    {dept.id}
                                </span>

                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-navy-900 border border-navy-600 p-2 rounded-lg shadow-xl z-20 pointer-events-none">
                                        <div className="text-xs font-bold text-white text-center">{dept.name}</div>
                                        <div className="text-[10px] text-gray-400 text-center mt-1">
                                            {dept.count} marchés actifs
                                        </div>
                                        <div className="text-[10px] text-gold-500 text-center uppercase tracking-wider mt-1">
                                            {dept.type}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="mt-6 text-sm text-gray-500 italic">
                Vue "Cartogramme" : Chaque case représente un département. La position est approximative.
            </p>
        </div>
    );
}
