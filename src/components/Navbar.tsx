'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

import { Home } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass-panel h-16">
            <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <Link href="/" className="text-white font-bold tracking-tighter text-lg flex items-center gap-2 group">
                        <Home className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                        TENDERSPOTTER
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
                        <Link href="/" className="text-white">Marchés</Link>
                        <Link href="/carte" className="hover:text-white transition-colors">Carte</Link>
                        <Link href="/acheteurs" className="hover:text-white transition-colors">Acheteurs</Link>
                        <Link href="#" className="hover:text-white transition-colors">Alertes</Link>
                        <Link href="#" className="hover:text-white transition-colors">Favoris</Link>
                        <Link href="#" className="hover:text-white transition-colors">Stats</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Live Stream
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-xs font-medium text-slate-300 hover:text-white transition-colors">
                                Connexion
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: { avatarBox: "w-8 h-8" }
                            }}
                        />
                    </SignedIn>

                    <Link href="/repondre" className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-md hover:bg-slate-200 transition-colors">
                        Répondre
                    </Link>
                </div>
            </div>
        </nav>
    );
}
