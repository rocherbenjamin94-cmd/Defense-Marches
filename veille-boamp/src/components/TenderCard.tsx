'use client';

import { Clock, Building2, ArrowRight, TrendingUp, Shield } from 'lucide-react';
import { Tender } from '@/lib/types';
import Badge from './Badge';
import clsx from 'clsx';
import { useModal } from './ModalProvider';
import { getMarketIcon } from '@/lib/iconLogic';

interface TenderCardProps {
    tender: Tender;
    variant?: 'standard' | 'list-item' | 'large';
    className?: string;
}

export default function TenderCard({ tender, variant = 'standard', className }: TenderCardProps) {
    const { openModal } = useModal();

    const handleClick = () => {
        openModal(tender);
    };

    const isPrioritaire = tender.urgencyLevel === 'critical' || tender.urgencyLevel === 'urgent';
    const daysLeft = Math.ceil((new Date(tender.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const timeLabel = daysLeft > 0 ? `J-${daysLeft}` : 'Aujourd\'hui';

    // Get contextual icon
    const { icon: MarketIcon, color: iconColor, bg: iconBg } = getMarketIcon(tender.title + ' ' + tender.description);

    // VARIANT: LIST ITEM (Ministries / Interior) - Keep compact but update style
    if (variant === 'list-item') {
        return (
            <div
                onClick={handleClick}
                className="group flex items-center justify-between p-3 h-[80px] bg-[#121218] hover:bg-[#1a1a24] border border-navy-700 hover:border-navy-600 rounded-xl transition-all cursor-pointer"
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className={clsx("h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
                        <MarketIcon className={clsx("h-6 w-6", iconColor)} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                            {tender.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                            <Building2 className="h-3 w-3 mr-1" />
                            <span className="truncate">{tender.buyer.name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                    {tender.isDefenseEquipment && (
                        <Shield className="h-4 w-4 text-emerald-400" />
                    )}
                    <ArrowRight className="h-4 w-4 text-navy-600 group-hover:text-gold-500 transition-colors" />
                </div>
            </div>
        );
    }

    // VARIANT: LARGE (High Value) - Update to match new style
    if (variant === 'large') {
        return (
            <div
                onClick={handleClick}
                className="group relative w-full h-[200px] bg-[#121218] rounded-2xl border border-navy-700 p-5 flex flex-col justify-between hover:bg-[#1a1a24] hover:border-[#2a2a34] hover:scale-[1.02] hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
                <div className="flex justify-between items-start">
                    <div className={clsx("h-14 w-14 rounded-xl flex items-center justify-center", iconBg)}>
                        <MarketIcon className={clsx("h-8 w-8", iconColor)} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-gold-500 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Majeur</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {tender.isDefenseEquipment && (
                                <Badge variant="default" className="!text-[10px] !px-1.5 !py-0.5 !bg-emerald-600/20 !text-emerald-400 !border-emerald-600/30">
                                    <Shield className="h-3 w-3 mr-0.5" />
                                    Défense
                                </Badge>
                            )}
                            <Badge variant="outline" className="border-navy-600 text-gray-400">
                                {timeLabel}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-gold-400 transition-colors mb-1">
                        {tender.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="h-4 w-4 mr-1" />
                        <span className="truncate">{tender.buyer.name}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-navy-800">
                    <span className="text-xs font-medium text-gray-400 bg-navy-800/50 px-2 py-1 rounded">
                        {tender.sectors[0]}
                    </span>
                    <span className="text-xs font-bold text-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Voir <ArrowRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        );
    }

    // VARIANT: STANDARD (New Default) - 260x180px
    return (
        <div
            onClick={handleClick}
            className={clsx(
                "group relative flex-shrink-0 w-[260px] min-h-[200px] h-auto bg-[#121218] rounded-2xl border border-navy-700 p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:border-[#2a2a34] cursor-pointer",
                className
            )}>

            {/* Top Row: Icon & Badges */}
            <div className="flex justify-between items-start">
                <div className={clsx("h-11 w-11 rounded-[10px] flex items-center justify-center transition-colors group-hover:bg-opacity-20", iconBg)}>
                    <MarketIcon className={clsx("h-7 w-7 transition-all group-hover:brightness-110", iconColor)} />
                </div>
                <div className="flex items-center gap-1.5">
                    {tender.isDefenseEquipment && (
                        <Badge variant="default" className="!text-[10px] !px-1.5 !py-0.5 !bg-emerald-600/20 !text-emerald-400 !border-emerald-600/30">
                            <Shield className="h-3 w-3 mr-0.5" />
                            Défense
                        </Badge>
                    )}
                    <Badge variant={isPrioritaire ? 'destructive' : 'secondary'} className="!text-[10px] !px-1.5 !py-0.5">
                        {tender.publicationDate === new Date().toISOString().split('T')[0] ? 'NEW' : timeLabel}
                    </Badge>
                </div>
            </div>

            {/* Middle: Content */}
            <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
                <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-2 group-hover:text-gold-500 transition-colors mb-1">
                    {tender.title || "Titre non disponible"}
                </h3>
                <div className="flex items-center text-gray-500 text-[13px]">
                    <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{tender.buyer.name || "Acheteur non renseigné"}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-navy-800/50">
                <span className="text-[10px] font-medium text-gray-400 bg-navy-800/50 px-2 py-1 rounded">
                    {tender.sectors[0] || "Divers"}
                </span>
                <span className="text-[11px] font-bold text-gold-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                    Voir <ArrowRight className="h-3 w-3" />
                </span>
            </div>
        </div>
    );
}
