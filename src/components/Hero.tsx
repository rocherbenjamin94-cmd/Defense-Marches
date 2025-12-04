import { ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative bg-navy-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(#f1c40f 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800 border border-navy-700 mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-sm text-gray-300 font-medium">Mise à jour quotidienne : 03/12/2025</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Veille Stratégique des <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">
                            Marchés de Défense
                        </span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                        Accédez en temps réel aux opportunités du Ministère des Armées, de la DGA et des services de sécurité intérieure.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <button className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg shadow-lg shadow-gold-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                            Consulter les marchés
                            <ArrowRight className="h-5 w-5" />
                        </button>
                        <button className="px-8 py-4 bg-navy-800 hover:bg-navy-700 text-white font-semibold rounded-lg border border-navy-700 transition-all flex items-center justify-center">
                            Créer une alerte
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-navy-800/50 backdrop-blur-sm p-6 rounded-xl border border-navy-700">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-navy-700 text-gold-500 mx-auto mb-4">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">42</div>
                            <div className="text-sm text-gray-400">Marchés actifs ce jour</div>
                        </div>
                        <div className="bg-navy-800/50 backdrop-blur-sm p-6 rounded-xl border border-navy-700">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-navy-700 text-gold-500 mx-auto mb-4">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">12.5 M€</div>
                            <div className="text-sm text-gray-400">Volume estimé</div>
                        </div>
                        <div className="bg-navy-800/50 backdrop-blur-sm p-6 rounded-xl border border-navy-700">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-navy-700 text-gold-500 mx-auto mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">8</div>
                            <div className="text-sm text-gray-400">Acheteurs publics</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
