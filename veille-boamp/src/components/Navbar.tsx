'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Home, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center">

                {/* Logo - largeur fixe pour équilibrer */}
                <Link href="/marches" className="flex items-center gap-2 group w-48">
                    <Home className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <span className="text-lg font-bold text-white">TENDERSPOTTER</span>
                </Link>

                {/* Navigation principale - centrée */}
                <div className="flex-1 flex items-center justify-center gap-8">
                    <Link href="/marches" className="text-gray-300 hover:text-white transition-colors font-medium">
                        Marchés
                    </Link>
                    <Link href="/acheteurs" className="text-gray-300 hover:text-white transition-colors font-medium">
                        Acheteurs
                    </Link>
                    <Link href="/analyse" className="text-gray-300 hover:text-white transition-colors font-medium">
                        Analyse
                    </Link>
                    <Link href="/documents" className="text-gray-300 hover:text-white transition-colors font-medium">
                        Générer
                    </Link>
                </div>

                {/* Actions droite */}
                <div className="flex items-center gap-3">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                                Connexion
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Tableau de bord
                        </Link>
                        <UserButton
                            appearance={{
                                elements: { avatarBox: "w-9 h-9" }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
