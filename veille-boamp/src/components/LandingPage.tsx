'use client';

import { Play, CheckCircle, TrendingUp, Building2, Shield, Users, Rocket, Search, Sparkles, FileText, ChevronRight, ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function LandingPage() {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const handleVoirDemo = () => {
        document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCommencer = () => {
        if (isSignedIn) {
            router.push('/marches');
        } else {
            router.push('/sign-up');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-950">
            {/* HERO SECTION - UNIFIED */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
                {/* Background avec effet radar */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                    {/* Cercles radar animés */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-[600px] h-[600px] border border-blue-500/20 dark:border-blue-500/10 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/20 dark:border-blue-500/10 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-blue-500/20 dark:border-blue-500/10 rounded-full"></div>
                    </div>

                    {/* Ligne de balayage radar */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent origin-left animate-spin" style={{ animationDuration: '4s' }}></div>
                    </div>

                    {/* Glow effects */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 dark:bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Texte gauche */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-6">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                +127 nouveaux marchés cette semaine
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                    TENDERSPOTTER
                                </span>
                                <br />
                                <span className="text-gray-900 dark:text-white">Gagnez des marchés</span>
                                <br />
                                <span className="text-gray-900 dark:text-white">publics </span>
                                <span className="text-blue-400">Défense</span>
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                                Détectez les opportunités, analysez votre compatibilité et générez vos documents DC1/DC2 en 30 secondes avec l'IA.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <Link
                                    href="/marches"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
                                >
                                    Voir les marchés
                                </Link>
                                <button
                                    onClick={() => window.open('https://youtu.be/qTjALPJyFwg', '_blank')}
                                    className="px-8 py-4 bg-gray-100 border border-gray-200 hover:bg-gray-200 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-xl font-semibold text-lg transition-all flex items-center gap-2"
                                >
                                    <Play className="w-5 h-5" /> Voir la démo
                                </button>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" /> 5 générations gratuites
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" /> Sans carte bancaire
                                </span>
                            </div>
                        </div>

                        {/* Screenshot/Mockup droite */}
                        <div className="relative hidden lg:block">
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl dark:shadow-2xl overflow-hidden">
                                {/* Barre de fenêtre */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-4 text-xs text-gray-500">tenderspotter.fr/marches</span>
                                </div>

                                {/* Contenu mockup réaliste */}
                                <div className="p-4 space-y-3">
                                    {/* Barre de recherche fake */}
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-4 py-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-gray-400 text-sm">Rechercher un marché...</span>
                                        <div className="ml-auto px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded text-xs text-white font-medium">Scan IA</div>
                                    </div>

                                    {/* Cards de marchés fake */}
                                    <div className="space-y-2">
                                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600 hover:border-blue-500/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-gray-900 dark:text-white text-sm font-medium">Maintenance systèmes radar</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">DGA • Île-de-France</p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full font-medium">12j</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600 hover:border-blue-500/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-gray-900 dark:text-white text-sm font-medium">Fourniture uniformes tactiques</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Gendarmerie • National</p>
                                                </div>
                                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-full font-medium">5j</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600 hover:border-blue-500/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-gray-900 dark:text-white text-sm font-medium">Développement logiciel embarqué</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Marine Nationale • Brest</p>
                                                </div>
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium">23j</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Badge flottant */}
                            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
                                        <p className="text-sm text-gray-500">Compatibilité</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF - IMPROVED */}
            <section className="py-20 border-y border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Titre */}
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Conçu pour les entreprises du secteur
                            <span className="text-blue-500 dark:text-blue-400"> défense & sécurité</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Que vous soyez une PME, une ETI ou une startup, TenderSpotter s'adapte à vos besoins.
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* PME Défense */}
                        <div className="group p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Building2 className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PME Défense</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">+500 entreprises éligibles</p>
                            <p className="text-sm text-gray-600 dark:text-gray-500">
                                Accédez aux marchés réservés PME et maximisez vos chances avec l'analyse IA.
                            </p>
                        </div>

                        {/* ETI Sécurité */}
                        <div className="group p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-cyan-500/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300">
                            <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ETI Sécurité</h3>
                            <p className="text-sm text-cyan-600 dark:text-cyan-400 mb-3">Secteur stratégique</p>
                            <p className="text-sm text-gray-600 dark:text-gray-500">
                                Identifiez les opportunités à fort enjeu et répondez plus vite que vos concurrents.
                            </p>
                        </div>

                        {/* Sous-traitants */}
                        <div className="group p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-green-500/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300">
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7 text-green-500 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sous-traitants</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 mb-3">Rang 1 & 2</p>
                            <p className="text-sm text-gray-600 dark:text-gray-500">
                                Trouvez les marchés où positionner votre expertise technique spécialisée.
                            </p>
                        </div>

                        {/* Startups BITD */}
                        <div className="group p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-purple-500/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Rocket className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Startups BITD</h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">Innovation défense</p>
                            <p className="text-sm text-gray-600 dark:text-gray-500">
                                Repérez les marchés innovation et entrez dans l'écosystème défense français.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* COMMENT ÇA MARCHE - AMÉLIORÉ */}
            <section id="comment-ca-marche" className="py-20 bg-white dark:bg-transparent">
                <div className="max-w-6xl mx-auto px-6">

                    {/* Titre */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Répondez à un marché en <span className="text-blue-500 dark:text-blue-400">3 étapes</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Plus besoin de passer des heures sur les documents administratifs
                        </p>
                    </div>

                    {/* Étapes avec flèches */}
                    <div className="grid md:grid-cols-3 gap-6 relative">

                        {/* Flèches entre les cards (desktop only) */}
                        <div className="hidden md:block absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 z-10">
                            <ChevronRight className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <div className="hidden md:block absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 z-10">
                            <ChevronRight className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        </div>

                        {/* Étape 1 */}
                        <div className="relative p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-blue-500/50 transition-all group shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                                    1
                                </div>
                                <Search className="w-6 h-6 text-blue-500 dark:text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Trouvez votre marché</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Notre IA scanne les appels d'offres défense et calcule votre score de compatibilité.
                            </p>
                        </div>

                        {/* Étape 2 */}
                        <div className="relative p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-cyan-500/50 transition-all group shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
                                    2
                                </div>
                                <BarChart3 className="w-6 h-6 text-cyan-500 dark:text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analysez l'appel d'offres</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Recevez une fiche synthétique avec les critères clés et les documents requis.
                            </p>
                        </div>

                        {/* Étape 3 */}
                        <div className="relative p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-green-500/50 transition-all group shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/25">
                                    3
                                </div>
                                <FileText className="w-6 h-6 text-green-500 dark:text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Générez vos documents</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                DC1, DC2, mémoire technique... générés automatiquement et pré-remplis.
                            </p>
                        </div>

                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <Link
                            href="/marches"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                        >
                            Commencer maintenant
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <p className="text-gray-500 text-sm mt-3">Gratuit • 5 générations offertes</p>
                    </div>

                </div>
            </section>

            {/* EARLY ACCESS */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900/50 border-y border-gray-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 text-center">

                    {/* Badge Early Access */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Early Access • Lancement 2025
                    </div>

                    {/* Titre */}
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Soyez parmi les premiers
                    </h2>

                    {/* Sous-titre */}
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        TenderSpotter est en phase de lancement. Rejoignez les entreprises qui prennent une longueur d'avance sur les marchés défense.
                    </p>

                    {/* Avantages early adopters */}
                    <div className="flex flex-wrap justify-center gap-6 mb-10">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>5 générations gratuites</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Accès prioritaire aux nouvelles features</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Support direct avec l'équipe</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => router.push('/sign-up')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
                    >
                        Rejoindre l'early access →
                    </button>

                    {/* Mention légale */}
                    <p className="text-gray-500 text-sm mt-6">
                        Gratuit • Sans carte bancaire • Annulable à tout moment
                    </p>

                </div>
            </section>

            {/* CONTACTEZ-NOUS */}
            <section id="contact" className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Contactez-nous
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        Une question ? Un besoin spécifique ? Notre équipe est à votre écoute.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        {/* Email */}
                        <a
                            href="mailto:contact@tenderspotter.fr"
                            className="flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    contact@tenderspotter.fr
                                </p>
                            </div>
                        </a>

                        {/* LinkedIn */}
                        <a
                            href="https://linkedin.com/company/tenderspotter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                                <p className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    TenderSpotter
                                </p>
                            </div>
                        </a>
                    </div>

                    <p className="text-gray-500 text-sm mt-8">
                        Réponse sous 24h • Du lundi au vendredi
                    </p>
                </div>
            </section>
        </div>
    );
}
