'use client';

import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BUYERS_LOCATIONS } from '@/lib/buyers';
import { ArrowLeft, Bell, MapPin, ExternalLink, Building2, Filter } from 'lucide-react';
import clsx from 'clsx';
import BuyerHistory from '@/components/BuyerHistory';
import Badge from '@/components/Badge';

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

export default function BuyerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const buyerId = params.id as string;
    const buyer = BUYERS_LOCATIONS.find(b => b.id === buyerId);

    if (!buyer) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
                Acheteur non trouvé.
            </div>
        );
    }

    const familyStyle = FAMILY_COLORS[buyer.famille] || FAMILY_COLORS.mixte;
    const chartColor = familyStyle.includes('blue') ? '#3b82f6' :
        familyStyle.includes('red') ? '#ef4444' :
            familyStyle.includes('yellow') ? '#eab308' :
                familyStyle.includes('green') ? '#22c55e' : '#a855f7';

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-gold-500/30">
            <Navbar />

            <main className="pt-[70px] pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mt-8 mb-6 flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux acheteurs
                </button>

                {/* Header Card */}
                <div className="bg-[#121218] border border-navy-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Building2 className="h-64 w-64 text-white transform rotate-12 translate-x-12 -translate-y-12" />
                    </div>

                    <div className="relative z-10">
                        <div className={clsx("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-4", familyStyle)}>
                            {FAMILY_LABELS[buyer.famille]}
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">{buyer.nom}</h1>
                        <p className="text-xl text-gray-400 mb-8">{buyer.parent}</p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-[#0f0f14] border border-navy-700 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white mb-1">{buyer.activeTenders}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Actifs</div>
                            </div>
                            <div className="bg-[#0f0f14] border border-navy-700 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white mb-1">34</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Cette année</div>
                            </div>
                            <div className="bg-[#0f0f14] border border-navy-700 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white mb-1">
                                    {buyer.totalAmount ? `~${(buyer.totalAmount / 1000000).toFixed(1)}M€` : '-'}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">En cours</div>
                            </div>
                            <div className="bg-[#0f0f14] border border-navy-700 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white mb-1">{buyer.departement}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Département</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-lg transition-colors">
                                <Bell className="h-4 w-4" />
                                Créer une alerte
                            </button>
                            <button
                                onClick={() => router.push('/carte')}
                                className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white font-medium border border-navy-600 rounded-lg transition-colors"
                            >
                                <MapPin className="h-4 w-4" />
                                Voir sur la carte
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-8">

                        {/* Information Details */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-navy-800 pb-2">
                                Informations
                            </h2>
                            <div className="bg-[#121218] border border-navy-700 rounded-xl p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-gray-500">Tutelle</div>
                                    <div className="col-span-2 text-white font-medium">{buyer.parent}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-gray-500">Adresse</div>
                                    <div className="col-span-2 text-white">{buyer.adresse}, {buyer.departement}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-gray-500">Site web</div>
                                    <div className="col-span-2">
                                        {buyer.website ? (
                                            <a href={buyer.website} target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:text-gold-400 flex items-center gap-1">
                                                {buyer.website.replace('https://', '')} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : '-'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Active Tenders */}
                        <section>
                            <div className="flex items-center justify-between mb-4 border-b border-navy-800 pb-2">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    Marchés en cours ({buyer.activeTenders})
                                </h2>
                                <button className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1">
                                    Filtrer <Filter className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Mock Tender Cards reusing style */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#121218] border border-navy-700 rounded-xl p-5 hover:border-navy-600 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="secondary" className="!text-xs">J-{i * 5}</Badge>
                                            <span className="text-xs text-gray-500">Procédure adaptée • Fournitures</span>
                                        </div>
                                        <h3 className="text-base font-bold text-white group-hover:text-gold-500 transition-colors mb-2">
                                            Maintenance préventive et corrective des équipements {i}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">150k€ - 500k€</span>
                                            <span className="text-gold-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Voir →</span>
                                        </div>
                                    </div>
                                ))}

                                <button className="w-full py-3 text-sm font-medium text-gray-400 hover:text-white border border-navy-700 rounded-xl hover:bg-navy-800 transition-colors">
                                    Voir les marchés clôturés (27) ▼
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-navy-800 pb-2">
                                Historique
                            </h2>
                            <div className="bg-[#121218] border border-navy-700 rounded-xl p-6">
                                <h3 className="text-xs text-gray-400 mb-4">Marchés par mois (12 derniers mois)</h3>
                                <BuyerHistory color={chartColor} />

                                <div className="mt-6 space-y-3 pt-6 border-t border-navy-800">
                                    <h4 className="text-xs font-bold text-white">Domaines principaux</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>Véhicules</span>
                                            <span className="text-white font-medium">45%</span>
                                        </div>
                                        <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-gold-500 h-full w-[45%]"></div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                            <span>Optronique</span>
                                            <span className="text-white font-medium">30%</span>
                                        </div>
                                        <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[30%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

            </main>
        </div>
    );
}
