'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Building2, Save, Search, CheckCircle } from 'lucide-react';
import { getProfil, saveProfil, ProfilEntreprise } from '@/services/analyseService';
import { useRouter } from 'next/navigation';

const DOMAINES = [
    'BTP / Construction',
    'Informatique / Digital',
    'Sécurité / Gardiennage',
    'Nettoyage / Propreté',
    'Transport / Logistique',
    'Formation',
    'Conseil',
    'Maintenance',
    'Fournitures',
    'Restauration',
    'Communication',
    'Défense / Armement'
];

const CERTIFICATIONS = [
    'ISO 9001',
    'ISO 14001',
    'ISO 27001',
    'ISO 45001',
    'Qualiopi',
    'RGE',
    'Qualibat',
    'MASE',
    'APSAD'
];

const TRANCHES_CA = [
    'Moins de 100K€',
    '100K€ - 500K€',
    '500K€ - 1M€',
    '1M€ - 5M€',
    '5M€ - 10M€',
    'Plus de 10M€'
];

const TRANCHES_EFFECTIF = [
    '1-10 salariés',
    '11-50 salariés',
    '51-200 salariés',
    '201-500 salariés',
    'Plus de 500 salariés'
];

const ZONES = [
    'Île-de-France',
    'Auvergne-Rhône-Alpes',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Hauts-de-France',
    'Provence-Alpes-Côte d\'Azur',
    'Grand Est',
    'Pays de la Loire',
    'Normandie',
    'Bretagne',
    'Bourgogne-Franche-Comté',
    'Centre-Val de Loire',
    'Corse',
    'DOM-TOM',
    'France entière'
];

export default function ProfilPage() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const [profil, setProfil] = useState<ProfilEntreprise>({
        siret: '',
        raisonSociale: '',
        adresse: '',
        domainesActivite: [],
        chiffreAffaires: '',
        effectif: '',
        certifications: [],
        referencesMarches: '',
        zonesGeographiques: []
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [saved, setSaved] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Charger le profil existant
    useEffect(() => {
        if (isLoaded && userId) {
            getProfil(userId)
                .then((result) => {
                    if (result.exists && result.data) {
                        setProfil(result.data);
                    }
                })
                .catch(console.error)
                .finally(() => setInitialLoading(false));
        } else if (isLoaded && !userId) {
            setInitialLoading(false);
        }
    }, [userId, isLoaded]);

    // Auto-complete via backend quand SIRET rempli
    const rechercherSiret = async () => {
        if (profil.siret.length !== 14) return;

        setSearching(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/entreprise/search?siret=${profil.siret}`);
            const data = await response.json();
            if (data.success && data.data) {
                setProfil(prev => ({
                    ...prev,
                    raisonSociale: data.data.raisonSociale || data.data.nom_entreprise || '',
                    adresse: data.data.adresse || data.data.siege?.adresse || ''
                }));
            }
        } catch (error) {
            console.error('Erreur recherche SIRET:', error);
        }
        setSearching(false);
    };

    const toggleSelection = (field: 'domainesActivite' | 'certifications' | 'zonesGeographiques', value: string) => {
        setProfil(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const sauvegarder = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            await saveProfil(userId, profil);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
        setLoading(false);
    };

    if (!isLoaded || initialLoading) {
        return (
            <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center">
                <div className="text-slate-400">Chargement...</div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Connectez-vous pour accéder à votre profil</p>
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0D11] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-500" />
                        Profil Entreprise
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Complétez votre profil pour obtenir des scores de compatibilité personnalisés
                    </p>
                    {user?.primaryEmailAddress && (
                        <p className="text-sm text-slate-500 mt-1">
                            Connecté en tant que {user.primaryEmailAddress.emailAddress}
                        </p>
                    )}
                </div>

                <div className="space-y-6">
                    {/* SIRET */}
                    <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-white mb-2">
                            SIRET de votre entreprise
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={profil.siret}
                                onChange={(e) => setProfil(prev => ({ ...prev, siret: e.target.value.replace(/\D/g, '').slice(0, 14) }))}
                                placeholder="12345678901234"
                                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={rechercherSiret}
                                disabled={profil.siret.length !== 14 || searching}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {searching ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                Rechercher
                            </button>
                        </div>

                        {profil.raisonSociale && (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="font-medium text-green-300">{profil.raisonSociale}</p>
                                <p className="text-sm text-green-400/70">{profil.adresse}</p>
                            </div>
                        )}
                    </div>

                    {/* Domaines d'activité */}
                    <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-white mb-3">
                            Domaines d'activité
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DOMAINES.map(domaine => (
                                <button
                                    key={domaine}
                                    onClick={() => toggleSelection('domainesActivite', domaine)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${profil.domainesActivite.includes(domaine)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {domaine}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CA et Effectif */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                            <label className="block text-sm font-medium text-white mb-2">
                                Chiffre d'affaires annuel
                            </label>
                            <select
                                value={profil.chiffreAffaires}
                                onChange={(e) => setProfil(prev => ({ ...prev, chiffreAffaires: e.target.value }))}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Sélectionner...</option>
                                {TRANCHES_CA.map(tranche => (
                                    <option key={tranche} value={tranche}>{tranche}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                            <label className="block text-sm font-medium text-white mb-2">
                                Effectif
                            </label>
                            <select
                                value={profil.effectif}
                                onChange={(e) => setProfil(prev => ({ ...prev, effectif: e.target.value }))}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Sélectionner...</option>
                                {TRANCHES_EFFECTIF.map(tranche => (
                                    <option key={tranche} value={tranche}>{tranche}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-white mb-3">
                            Certifications
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CERTIFICATIONS.map(cert => (
                                <button
                                    key={cert}
                                    onClick={() => toggleSelection('certifications', cert)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${profil.certifications.includes(cert)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {cert}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zones géographiques */}
                    <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-white mb-3">
                            Zones d'intervention
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ZONES.map(zone => (
                                <button
                                    key={zone}
                                    onClick={() => toggleSelection('zonesGeographiques', zone)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${profil.zonesGeographiques.includes(zone)
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Références marchés */}
                    <div className="bg-[#14181F] rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-white mb-2">
                            Expérience marchés publics
                        </label>
                        <select
                            value={profil.referencesMarches}
                            onChange={(e) => setProfil(prev => ({ ...prev, referencesMarches: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Sélectionner...</option>
                            <option value="Aucune">Aucune expérience</option>
                            <option value="1-2">1 à 2 marchés</option>
                            <option value="3-5">3 à 5 marchés</option>
                            <option value="6-10">6 à 10 marchés</option>
                            <option value="10+">Plus de 10 marchés</option>
                        </select>
                    </div>

                    {/* Bouton sauvegarder */}
                    <button
                        onClick={sauvegarder}
                        disabled={loading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : saved ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Profil sauvegardé !
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Sauvegarder mon profil
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
