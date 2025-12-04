'use client';

import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { BuyerLocation } from '@/lib/buyers';
import clsx from 'clsx';
import Badge from './Badge';

interface BuyerCardProps {
    buyer: BuyerLocation;
}

const FAMILY_COLORS = {
    armees: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    interieur: 'text-red-400 bg-red-400/10 border-red-400/20',
    renseignement: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    etablissements: 'text-green-400 bg-green-400/10 border-green-400/20',
    collectivites: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    mixte: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

const FAMILY_LABELS = {
    armees: 'Armées',
    interieur: 'Intérieur',
    renseignement: 'Renseignement',
    etablissements: 'Établissements',
    collectivites: 'Collectivités',
    mixte: 'Mixte',
};

export default function BuyerCard({ buyer }: BuyerCardProps) {
    const familyStyle = FAMILY_COLORS[buyer.famille] || FAMILY_COLORS.mixte;

    return (
        <Link href={`/acheteurs/${buyer.id}`} className="block group">
            <div className="bg-[#121218] border border-navy-700 rounded-xl p-5 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-300 relative overflow-hidden">

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                <div className="flex items-start justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={clsx("w-2 h-2 rounded-full", familyStyle.split(' ')[0].replace('text-', 'bg-').replace('-400', '-500'))}></div>
                            <h3 className="text-lg font-bold text-white truncate group-hover:text-gold-500 transition-colors">
                                {buyer.nom}
                            </h3>
                            <Badge variant="outline" className="text-xs text-gray-500 border-navy-600">
                                {buyer.departement}
                            </Badge>
                        </div>

                        <div className="flex items-center text-sm text-gray-400 mb-4">
                            <span className="truncate">{buyer.parent}</span>
                            <span className="mx-2">•</span>
                            <span className="truncate">{buyer.adresse}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-300">
                                <span className="text-lg mr-2">📋</span>
                                <span className="font-bold text-white">{buyer.activeTenders}</span>
                                <span className="ml-1 text-gray-500">actifs</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <span className="text-lg mr-2">📦</span>
                                <span className="font-bold text-white">34</span>
                                <span className="ml-1 text-gray-500">cette année</span>
                            </div>
                            {buyer.totalAmount && (
                                <div className="flex items-center text-gray-300">
                                    <span className="text-lg mr-2">💰</span>
                                    <span className="font-bold text-white">~{(buyer.totalAmount / 1000000).toFixed(1)}M€</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Action */}
                    <div className="flex flex-col items-end justify-between self-stretch">
                        <div className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border", familyStyle)}>
                            {FAMILY_LABELS[buyer.famille]}
                        </div>
                        <div className="flex items-center text-gold-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            Voir <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
