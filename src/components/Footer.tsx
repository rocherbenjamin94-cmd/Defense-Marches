import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-navy-900 text-white border-t border-navy-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-6 w-6 text-gold-500" />
                            <span className="text-lg font-bold">DefenseTender</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            La plateforme de référence pour la veille des marchés publics de défense et sécurité.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-4">Navigation</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">Accueil</Link></li>
                            <li><Link href="/tenders" className="text-gray-300 hover:text-white text-sm transition-colors">Marchés</Link></li>
                            <li><Link href="/stats" className="text-gray-300 hover:text-white text-sm transition-colors">Statistiques</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-4">Légal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/mentions-legales" className="text-gray-300 hover:text-white text-sm transition-colors">Mentions légales</Link></li>
                            <li><Link href="/cgu" className="text-gray-300 hover:text-white text-sm transition-colors">CGU</Link></li>
                            <li><Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">Confidentialité</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="text-gray-300 text-sm">support@defensetender.fr</li>
                            <li className="text-gray-300 text-sm">Paris, France</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-navy-800 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} DefenseTender. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
