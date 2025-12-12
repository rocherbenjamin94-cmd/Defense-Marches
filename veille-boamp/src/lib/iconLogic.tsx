import {
    Shield, Server, Lock, Radio, Phone, Armchair, Truck, Ship, Plane,
    Target, Camera, Eye, Wrench, Cpu, Zap, Building, GraduationCap,
    Heart, Shirt, Utensils, Sparkles, FileText
} from 'lucide-react';

export const getMarketIcon = (objet: string) => {
    const text = objet?.toLowerCase() || '';

    // Sécurité / Cyber / SI
    if (/sécurité|cybersécurité|cyberdefense|protection|surveillance/.test(text))
        return { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' };

    if (/système.*(information|informatique)|si\b|cloud|hébergement|serveur/.test(text))
        return { icon: Server, color: 'text-indigo-400', bg: 'bg-indigo-400/10' };

    if (/confidentiel|secret|habilit/.test(text))
        return { icon: Lock, color: 'text-red-400', bg: 'bg-red-400/10' };

    // Télécom / Radio
    if (/radio|vhf|uhf|télécommunication|transmission|fréquence|antenne|émetteur/.test(text))
        return { icon: Radio, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };

    if (/téléphon|mobile|réseau/.test(text))
        return { icon: Phone, color: 'text-blue-400', bg: 'bg-blue-400/10' };

    // Mobilier / Bureau
    if (/mobilier|bureau|siège|chaise|armoire|meuble|aménagement.*(bureau|locaux)|fourniture.*(bureau)/.test(text))
        return { icon: Armchair, color: 'text-teal-400', bg: 'bg-teal-400/10' };

    // Véhicules
    if (/véhicule|blindé|camion|transport|automobile|vl\b|pl\b|voiture/.test(text))
        return { icon: Truck, color: 'text-orange-400', bg: 'bg-orange-400/10' };

    // Naval
    if (/naval|maritime|navire|bateau|port|marine|sous-marin/.test(text))
        return { icon: Ship, color: 'text-cyan-400', bg: 'bg-cyan-400/10' };

    // Aérien
    if (/aéronef|avion|hélicoptère|drone|uav|aérien|aviation/.test(text))
        return { icon: Plane, color: 'text-sky-400', bg: 'bg-sky-400/10' };

    // Armement
    if (/arme|munition|balistique|tir|missile|pyrotechn/.test(text))
        return { icon: Target, color: 'text-red-500', bg: 'bg-red-500/10' };

    // Optique / Surveillance
    if (/optronique|caméra|vidéo|optique|vision|détection|imagerie/.test(text))
        return { icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };

    if (/radar|sonar|renseignement/.test(text))
        return { icon: Eye, color: 'text-green-400', bg: 'bg-green-400/10' };

    // Maintenance / Technique
    if (/maintenance|réparation|entretien|mco\b|mcm\b|soutien/.test(text))
        return { icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-400/10' };

    if (/électronique|composant|carte|circuit|équipement/.test(text))
        return { icon: Cpu, color: 'text-violet-400', bg: 'bg-violet-400/10' };

    if (/énergie|électri|groupe.*(électrogène)|batterie/.test(text))
        return { icon: Zap, color: 'text-yellow-300', bg: 'bg-yellow-300/10' };

    // BTP
    if (/travaux|construction|bâtiment|rénovation|infrastructure|génie/.test(text))
        return { icon: Building, color: 'text-gray-300', bg: 'bg-gray-300/10' };

    // Formation
    if (/formation|instruction|entraînement|simulation|stage/.test(text))
        return { icon: GraduationCap, color: 'text-pink-400', bg: 'bg-pink-400/10' };

    // Médical
    if (/médical|santé|soin|infirmier|nrbc|pharmaceut/.test(text))
        return { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' };

    // Textile / Équipement individuel
    if (/habillement|textile|uniforme|gilet|tenue|vêtement/.test(text))
        return { icon: Shirt, color: 'text-lime-400', bg: 'bg-lime-400/10' };

    // Alimentation
    if (/alimenta|restauration|repas|traiteur|denrée/.test(text))
        return { icon: Utensils, color: 'text-orange-300', bg: 'bg-orange-300/10' };

    // Nettoyage
    if (/nettoyage|propreté|hygiène|entretien.*(locaux)/.test(text))
        return { icon: Sparkles, color: 'text-cyan-300', bg: 'bg-cyan-300/10' };

    // Défaut
    return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500/10' };
};
