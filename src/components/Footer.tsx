'use client';

import Link from 'next/link';
import { Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0C0E12] pt-12 pb-8">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-white font-bold tracking-tighter text-sm flex items-center gap-2 mb-4">
                            TENDERSPOTTER
                        </Link>
                        <p className="text-xs text-slate-500">La plateforme de référence pour les marchés publics de défense et sécurité en France.</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Plateforme</h4>
                        <ul className="space-y-2 text-xs text-slate-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Marchés</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Analyse DGA</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Tarifs</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Ressources</h4>
                        <ul className="space-y-2 text-xs text-slate-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Guide des MP</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog Défense</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Partenaires</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Légal</h4>
                        <ul className="space-y-2 text-xs text-slate-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Mentions légales</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">CGV</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-8">
                    <p className="text-xs text-slate-600">© 2024 TenderSpotter SAS. Tous droits réservés.</p>
                    <div className="flex gap-4">
                        <Twitter className="w-4 h-4 text-slate-600 hover:text-white cursor-pointer transition-colors" />
                        <Linkedin className="w-4 h-4 text-slate-600 hover:text-white cursor-pointer transition-colors" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
