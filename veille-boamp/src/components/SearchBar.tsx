import { Search, Filter } from 'lucide-react';

export default function SearchBar() {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-colors"
                        placeholder="Rechercher un marché (ex: drones, cybersécurité, gilets...)"
                    />
                </div>

                <div className="flex gap-4">
                    <select className="block w-full md:w-48 pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm rounded-lg">
                        <option>Tous les secteurs</option>
                        <option>Défense</option>
                        <option>Sécurité</option>
                        <option>Informatique</option>
                        <option>BTP</option>
                    </select>

                    <button className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500">
                        <Filter className="h-5 w-5 mr-2 text-gray-400" />
                        Filtres
                    </button>

                    <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-navy-900 bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500">
                        Rechercher
                    </button>
                </div>
            </div>
        </div>
    );
}
