import Link from 'next/link';
import { Search, Bell, Shield, User } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900 border-b border-navy-700 h-[70px]">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

                {/* Logo (Left) */}
                <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
                    <Shield className="h-7 w-7 text-gold-500 group-hover:text-gold-400 transition-colors" />
                    <div className="flex flex-col leading-none">
                        <span className="text-lg font-bold text-white tracking-wider">
                            <span className="text-gold-500">DÉFENSE</span> MARCHÉS
                        </span>
                    </div>
                </Link>

                {/* Search (Center) */}
                <div className="hidden md:flex flex-1 max-w-[450px] relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-navy-800 border border-navy-700 rounded-lg leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-navy-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 sm:text-sm transition-all"
                        placeholder="Drones, cybersécurité, véhicules blindés..."
                    />
                </div>

                {/* Nav & Actions (Right) */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
                        <Link href="/" className="hover:text-white transition-colors">Marchés</Link>
                        <Link href="/carte" className="hover:text-white transition-colors">Carte</Link>
                        <Link href="/acheteurs" className="hover:text-white transition-colors">Acheteurs</Link>
                        <Link href="#" className="hover:text-white transition-colors">Alertes</Link>
                        <Link href="#" className="hover:text-white transition-colors">Favoris</Link>
                        <Link href="#" className="hover:text-white transition-colors">Stats</Link>
                    </div>

                    <div className="h-8 w-[1px] bg-navy-700 hidden lg:block"></div>

                    <div className="flex items-center gap-3">
                        <button className="hidden sm:block px-4 py-2 text-sm font-medium text-white border border-navy-600 rounded-lg hover:bg-navy-800 transition-colors">
                            Connexion
                        </button>
                        <button className="px-4 py-2 text-sm font-bold text-navy-900 bg-gold-500 rounded-lg hover:bg-gold-400 transition-colors">
                            Inscription
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
