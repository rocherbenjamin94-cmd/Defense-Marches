import clsx from 'clsx';

interface StatsBarProps {
    openCount: number;
    todayCount: number;
    closingCount: number;
    armyCount: number;
    lastSync: Date | null;
    loading?: boolean;
}

export default function StatsBar({
    openCount,
    todayCount,
    closingCount,
    armyCount,
    lastSync,
    loading = false
}: StatsBarProps) {
    const minutesAgo = lastSync ? Math.floor((Date.now() - lastSync.getTime()) / 60000) : null;
    const syncText = minutesAgo !== null ? `${minutesAgo}min` : '...';

    return (
        <div className="bg-[#0f0f14] border-b border-[#1a1a24] py-2 px-4 mt-[70px]">
            <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">

                {/* Live Indicator */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="font-medium text-gray-400">Live</span>
                </div>

                {loading ? (
                    <span className="animate-pulse text-gray-500">Chargement des données...</span>
                ) : (
                    <>
                        {/* Mobile View (< 768px) */}
                        <div className="flex md:hidden items-center gap-3 text-gray-400">
                            <span><span className="text-white font-bold">{openCount}</span> ouverts</span>
                            <span className="text-gray-600">•</span>
                            <span><span className="text-white font-bold">{todayCount}</span> nouveaux</span>
                        </div>

                        {/* Desktop View (>= 768px) */}
                        <div className="hidden md:flex items-center gap-6 text-gray-400">
                            <span className="text-gray-400">📋 {openCount} marchés ouverts</span>
                            <span className="text-gray-400">⚡ {todayCount} publiés aujourd'hui</span>
                            <span className="text-gray-400">🔥 {closingCount} clôturent cette semaine</span>
                            <span className="text-gray-400">🏛️ {armyCount} Ministère des Armées</span>
                            <span className="text-gray-500 ml-auto">Sync il y a {syncText}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
