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
        <div className="h-[40px] bg-[#0f0f14] border-b border-navy-700 flex items-center justify-center text-[13px] text-gray-500 gap-3 sm:gap-6 mt-[70px] px-4 overflow-hidden whitespace-nowrap">

            {/* Live Indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="font-medium text-gray-400">Live</span>
            </div>

            <span className="text-navy-700">•</span>

            {loading ? (
                <span className="animate-pulse">Chargement des données...</span>
            ) : (
                <>
                    {/* Mobile View (< 768px) */}
                    <div className="flex md:hidden items-center gap-3">
                        <span><span className="text-white font-bold">{openCount}</span> ouverts</span>
                        <span className="text-navy-700">•</span>
                        <span><span className="text-white font-bold">{todayCount}</span> nouveaux</span>
                        <span className="text-navy-700">•</span>
                        <span>Sync {syncText}</span>
                    </div>

                    {/* Desktop View (>= 768px) */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span>📋</span>
                            <span><span className="text-white font-bold">{openCount}</span> marchés ouverts</span>
                        </div>

                        <span className="text-navy-700">•</span>

                        <div className="flex items-center gap-2">
                            <span>⚡</span>
                            <span><span className="text-white font-bold">{todayCount}</span> publiés aujourd'hui</span>
                        </div>

                        <span className="text-navy-700">•</span>

                        <div className="flex items-center gap-2">
                            <span>🔥</span>
                            <span><span className="text-white font-bold">{closingCount}</span> clôturent cette semaine</span>
                        </div>

                        <span className="text-navy-700">•</span>

                        <div className="flex items-center gap-2">
                            <span>🏛️</span>
                            <span><span className="text-white font-bold">{armyCount}</span> Ministère des Armées</span>
                        </div>

                        <span className="text-navy-700">•</span>

                        <span>Sync il y a {syncText}</span>
                    </div>
                </>
            )}
        </div>
    );
}
