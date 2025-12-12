export interface AcheteurInterieur {
  id: string;
  code: string;
  nom: string;
  tutelle: string;
}

export const ACHETEURS_INTERIEUR: AcheteurInterieur[] = [
  // === GN - Gendarmerie Nationale ===
  // CDTNAT - Commandement de la gendarmerie dans le cyberespace
  { id: 'comcybergend', code: 'COMCYBERGEND', nom: 'Commandement de la gendarmerie dans le cyberespace', tutelle: 'GN' },

  // CEGN - Centre d'études de la gendarmerie nationale
  { id: 'cegn', code: 'CEGN', nom: 'Centre d\'études de la gendarmerie nationale', tutelle: 'GN' },

  // CGGM - Commandement de la gendarmerie dans les postes maritimes
  { id: 'cggm', code: 'CGGM', nom: 'Commandement de la gendarmerie dans les postes maritimes', tutelle: 'GN' },

  // DGGN - Direction générale de la gendarmerie nationale
  { id: 'dggn', code: 'DGGN', nom: 'Direction générale de la gendarmerie nationale', tutelle: 'GN' },
  { id: 'dggn-dpmgn', code: 'DGGN/DPMGN', nom: 'Direction des personnels militaires de la gendarmerie nationale', tutelle: 'GN' },
  { id: 'dggn-dsi', code: 'DGGN/DSI', nom: 'Direction des systèmes d\'information - Gendarmerie', tutelle: 'GN' },
  { id: 'dggn-dlog', code: 'DGGN/DLOG', nom: 'Direction de la logistique - Gendarmerie', tutelle: 'GN' },

  // DRHGN - Direction des ressources humaines de la gendarmerie nationale
  { id: 'drhgn', code: 'DRHGN', nom: 'Direction des ressources humaines de la gendarmerie nationale', tutelle: 'GN' },

  // DSF - Direction des soutiens et des finances
  { id: 'dsf-gn', code: 'DSF', nom: 'Direction des soutiens et des finances - Gendarmerie', tutelle: 'GN' },

  // IGGN - Inspection générale de la gendarmerie nationale
  { id: 'iggn', code: 'IGGN', nom: 'Inspection générale de la gendarmerie nationale', tutelle: 'GN' },

  // EPA - Établissements publics administratifs GN
  { id: 'cnfpt-gn', code: 'EPA/CNFPT-GN', nom: 'Centre national de formation de la police technique - Gendarmerie', tutelle: 'GN' },

  // RG - Régions de gendarmerie
  { id: 'rg-auvergne-rhone-alpes', code: 'RG ARA', nom: 'Région de gendarmerie Auvergne-Rhône-Alpes', tutelle: 'GN' },
  { id: 'rg-bourgogne-franche-comte', code: 'RG BFC', nom: 'Région de gendarmerie Bourgogne-Franche-Comté', tutelle: 'GN' },
  { id: 'rg-bretagne', code: 'RG BRE', nom: 'Région de gendarmerie Bretagne', tutelle: 'GN' },
  { id: 'rg-centre-val-de-loire', code: 'RG CVL', nom: 'Région de gendarmerie Centre-Val de Loire', tutelle: 'GN' },
  { id: 'rg-corse', code: 'RG COR', nom: 'Région de gendarmerie Corse', tutelle: 'GN' },
  { id: 'rg-grand-est', code: 'RG GE', nom: 'Région de gendarmerie Grand Est', tutelle: 'GN' },
  { id: 'rg-hauts-de-france', code: 'RG HDF', nom: 'Région de gendarmerie Hauts-de-France', tutelle: 'GN' },
  { id: 'rg-ile-de-france', code: 'RG IDF', nom: 'Région de gendarmerie Île-de-France', tutelle: 'GN' },
  { id: 'rg-normandie', code: 'RG NOR', nom: 'Région de gendarmerie Normandie', tutelle: 'GN' },
  { id: 'rg-nouvelle-aquitaine', code: 'RG NA', nom: 'Région de gendarmerie Nouvelle-Aquitaine', tutelle: 'GN' },
  { id: 'rg-occitanie', code: 'RG OCC', nom: 'Région de gendarmerie Occitanie', tutelle: 'GN' },
  { id: 'rg-pays-de-la-loire', code: 'RG PDL', nom: 'Région de gendarmerie Pays de la Loire', tutelle: 'GN' },
  { id: 'rg-provence-alpes-cote-azur', code: 'RG PACA', nom: 'Région de gendarmerie Provence-Alpes-Côte d\'Azur', tutelle: 'GN' },
  { id: 'gign', code: 'GIGN', nom: 'Groupe d\'intervention de la gendarmerie nationale', tutelle: 'GN' },
  { id: 'ggm', code: 'GGM', nom: 'Groupement de gendarmerie mobile', tutelle: 'GN' },
  { id: 'gta', code: 'GTA', nom: 'Groupement de transport aérien de la gendarmerie', tutelle: 'GN' },

  // === DGPN - Direction générale de la Police Nationale ===
  { id: 'dgpn', code: 'DGPN', nom: 'Direction générale de la Police nationale', tutelle: 'DGPN' },

  // BMSI - Bureau des moyens et des systèmes d'information
  { id: 'bmsi', code: 'BMSI', nom: 'Bureau des moyens et des systèmes d\'information - Police', tutelle: 'DGPN' },

  // DCPAF - Direction centrale de la police aux frontières
  { id: 'dcpaf', code: 'DCPAF', nom: 'Direction centrale de la police aux frontières', tutelle: 'DGPN' },
  { id: 'dcpaf-paf-roissy', code: 'PAF Roissy', nom: 'Police aux frontières Roissy', tutelle: 'DGPN' },
  { id: 'dcpaf-paf-orly', code: 'PAF Orly', nom: 'Police aux frontières Orly', tutelle: 'DGPN' },

  // DCRFPN - Direction centrale du recrutement et de la formation de la police nationale
  { id: 'dcrfpn', code: 'DCRFPN', nom: 'Direction centrale du recrutement et de la formation de la police nationale', tutelle: 'DGPN' },
  { id: 'enp-saint-malo', code: 'ENP Saint-Malo', nom: 'École nationale de police de Saint-Malo', tutelle: 'DGPN' },
  { id: 'enp-nimes', code: 'ENP Nîmes', nom: 'École nationale de police de Nîmes', tutelle: 'DGPN' },
  { id: 'enp-roubaix', code: 'ENP Roubaix', nom: 'École nationale de police de Roubaix', tutelle: 'DGPN' },
  { id: 'enp-sens', code: 'ENP Sens', nom: 'École nationale de police de Sens', tutelle: 'DGPN' },
  { id: 'ensp', code: 'ENSP', nom: 'École nationale supérieure de la police', tutelle: 'DGPN' },

  // DRCPN - Direction des ressources et des compétences de la police nationale
  { id: 'drcpn', code: 'DRCPN', nom: 'Direction des ressources et des compétences de la police nationale', tutelle: 'DGPN' },

  // SNDY - Service national des douanes judiciaires (rattaché DGPN)
  { id: 'sndy', code: 'SNDY', nom: 'Service national des douanes judiciaires', tutelle: 'DGPN' },

  // Autres directions DGPN
  { id: 'dcsp', code: 'DCSP', nom: 'Direction centrale de la sécurité publique', tutelle: 'DGPN' },
  { id: 'dcpj', code: 'DCPJ', nom: 'Direction centrale de la police judiciaire', tutelle: 'DGPN' },
  { id: 'dgsi', code: 'DGSI', nom: 'Direction générale de la sécurité intérieure', tutelle: 'DGPN' },
  { id: 'raid', code: 'RAID', nom: 'Recherche, Assistance, Intervention, Dissuasion', tutelle: 'DGPN' },
  { id: 'snps', code: 'SNPS', nom: 'Service national de police scientifique', tutelle: 'DGPN' },
  { id: 'stsi', code: 'STSI', nom: 'Service des technologies et des systèmes d\'information de la sécurité intérieure', tutelle: 'DGPN' },

  // === SAILMI - Service de l'achat, de l'innovation, de la logistique du MI ===
  { id: 'sailmi', code: 'SAILMI', nom: 'Service de l\'achat, de l\'innovation, de la logistique du ministère de l\'Intérieur', tutelle: 'SAILMI' },

  // BAIP - Bureau de l'achat et de l'innovation publique
  { id: 'baip', code: 'BAIP', nom: 'Bureau de l\'achat et de l\'innovation publique', tutelle: 'SAILMI' },

  // BAM - Bureau des achats mutualisés
  { id: 'bam', code: 'BAM', nom: 'Bureau des achats mutualisés', tutelle: 'SAILMI' },

  // BAN - Bureau des achats nationaux
  { id: 'ban', code: 'BAN', nom: 'Bureau des achats nationaux', tutelle: 'SAILMI' },

  // ECLIPM - Établissement central logistique de l'intérieur et des pièces mécaniques
  { id: 'eclipm', code: 'ECLIPM', nom: 'Établissement central logistique de l\'intérieur et des pièces mécaniques', tutelle: 'SAILMI' },

  // Pôles techniques SAILMI
  { id: 'sailmi-armement', code: 'SAILMI/ARM', nom: 'SAILMI - Pôle armement et équipements', tutelle: 'SAILMI' },
  { id: 'sailmi-vehicules', code: 'SAILMI/VEH', nom: 'SAILMI - Pôle véhicules', tutelle: 'SAILMI' },
  { id: 'sailmi-immobilier', code: 'SAILMI/IMM', nom: 'SAILMI - Pôle immobilier', tutelle: 'SAILMI' },
  { id: 'sailmi-numerique', code: 'SAILMI/NUM', nom: 'SAILMI - Pôle numérique', tutelle: 'SAILMI' },

  // === SATPN - Services administratifs et techniques de la police nationale ===
  { id: 'satpn', code: 'SATPN', nom: 'Services administratifs et techniques de la police nationale', tutelle: 'SATPN' },

  // Bureaux régionaux SATPN (outre-mer)
  { id: 'satpn-guadeloupe', code: 'SATPN 971', nom: 'SATPN Guadeloupe', tutelle: 'SATPN' },
  { id: 'satpn-martinique', code: 'SATPN 972', nom: 'SATPN Martinique', tutelle: 'SATPN' },
  { id: 'satpn-guyane', code: 'SATPN 973', nom: 'SATPN Guyane', tutelle: 'SATPN' },
  { id: 'satpn-reunion', code: 'SATPN 974', nom: 'SATPN La Réunion', tutelle: 'SATPN' },
  { id: 'satpn-mayotte', code: 'SATPN 976', nom: 'SATPN Mayotte', tutelle: 'SATPN' },
  { id: 'satpn-saint-pierre-miquelon', code: 'SATPN 975', nom: 'SATPN Saint-Pierre-et-Miquelon', tutelle: 'SATPN' },
  { id: 'satpn-nouvelle-caledonie', code: 'SATPN 988', nom: 'SATPN Nouvelle-Calédonie', tutelle: 'SATPN' },
  { id: 'satpn-polynesie', code: 'SATPN 987', nom: 'SATPN Polynésie française', tutelle: 'SATPN' },
  { id: 'satpn-wallis', code: 'SATPN 986', nom: 'SATPN Wallis-et-Futuna', tutelle: 'SATPN' },

  // === SGAMI - Secrétariats généraux pour l'administration du ministère de l'Intérieur ===
  { id: 'sgami-est', code: 'SGAMI EST', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Est', tutelle: 'SGAMI' },
  { id: 'sgami-idf', code: 'SGAMI IDF', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Île-de-France', tutelle: 'SGAMI' },
  { id: 'sgami-nord', code: 'SGAMI NORD', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Nord', tutelle: 'SGAMI' },
  { id: 'sgami-ouest', code: 'SGAMI OUEST', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Ouest', tutelle: 'SGAMI' },
  { id: 'sgami-sud', code: 'SGAMI SUD', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Sud', tutelle: 'SGAMI' },
  { id: 'sgami-sud-est', code: 'SGAMI SE', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Sud-Est', tutelle: 'SGAMI' },
  { id: 'sgami-sud-ouest', code: 'SGAMI SO', nom: 'Secrétariat général pour l\'administration du ministère de l\'Intérieur Sud-Ouest', tutelle: 'SGAMI' },

  // === AUTRE - Autres entités MININT ===
  // Préfectures
  { id: 'prefecture-police-paris', code: 'PP', nom: 'Préfecture de police de Paris', tutelle: 'AUTRE' },
  { id: 'prefecture-police-bspp', code: 'BSPP', nom: 'Brigade de sapeurs-pompiers de Paris', tutelle: 'AUTRE' },

  // DNUM - Direction du numérique
  { id: 'dnum-mi', code: 'DNUM', nom: 'Direction du numérique du ministère de l\'Intérieur', tutelle: 'AUTRE' },

  // DGSCGC - Direction générale de la sécurité civile et de la gestion des crises
  { id: 'dgscgc', code: 'DGSCGC', nom: 'Direction générale de la sécurité civile et de la gestion des crises', tutelle: 'AUTRE' },
  { id: 'cogic', code: 'COGIC', nom: 'Centre opérationnel de gestion interministérielle des crises', tutelle: 'AUTRE' },
  { id: 'formisc', code: 'FORMISC', nom: 'Formations militaires de la sécurité civile', tutelle: 'AUTRE' },

  // ANTS - Agence nationale des titres sécurisés
  { id: 'ants', code: 'ANTS', nom: 'Agence nationale des titres sécurisés', tutelle: 'AUTRE' },

  // ANTAI - Agence nationale de traitement automatisé des infractions
  { id: 'antai', code: 'ANTAI', nom: 'Agence nationale de traitement automatisé des infractions', tutelle: 'AUTRE' },

  // SG - Secrétariat général
  { id: 'sg-minint', code: 'SG MININT', nom: 'Secrétariat général du ministère de l\'Intérieur', tutelle: 'AUTRE' },
  { id: 'dmat', code: 'DMAT', nom: 'Direction de la modernisation et de l\'administration territoriale', tutelle: 'AUTRE' },

  // CIPDR - Comité interministériel de prévention de la délinquance et de la radicalisation
  { id: 'cipdr', code: 'CIPDR', nom: 'Comité interministériel de prévention de la délinquance et de la radicalisation', tutelle: 'AUTRE' },

  // OFPRA - Office français de protection des réfugiés et apatrides
  { id: 'ofpra', code: 'OFPRA', nom: 'Office français de protection des réfugiés et apatrides', tutelle: 'AUTRE' },

  // OFII - Office français de l'immigration et de l'intégration
  { id: 'ofii', code: 'OFII', nom: 'Office français de l\'immigration et de l\'intégration', tutelle: 'AUTRE' },

  // CNAPS - Conseil national des activités privées de sécurité
  { id: 'cnaps', code: 'CNAPS', nom: 'Conseil national des activités privées de sécurité', tutelle: 'AUTRE' },

  // INHESJ - Institut national des hautes études de la sécurité et de la justice
  { id: 'ihemi', code: 'IHEMI', nom: 'Institut des hautes études du ministère de l\'Intérieur', tutelle: 'AUTRE' },
];

// Fonction utilitaire pour obtenir le nom BOAMP
export function getBoampName(acheteur: AcheteurInterieur): string {
  return acheteur.nom;
}

// Obtenir les tutelles uniques
export function getTutellesInterieur(): string[] {
  const tutelles = new Set(ACHETEURS_INTERIEUR.map(a => a.tutelle));
  return Array.from(tutelles).sort();
}

// Filtrer par tutelle
export function filterByTutelleInterieur(tutelle: string): AcheteurInterieur[] {
  return ACHETEURS_INTERIEUR.filter(a => a.tutelle === tutelle);
}

// Rechercher un acheteur par nom (recherche partielle)
export function searchAcheteurInterieur(query: string): AcheteurInterieur[] {
  const q = query.toLowerCase();
  return ACHETEURS_INTERIEUR.filter(a =>
    a.nom.toLowerCase().includes(q) ||
    a.code.toLowerCase().includes(q)
  );
}

// Obtenir tous les noms pour requêtes BOAMP
export function getAllAcheteurInterieurNames(): string[] {
  return ACHETEURS_INTERIEUR.map(a => a.nom);
}
