export interface AcheteurDefense {
  id: string;
  code: string;
  nom: string;
  tutelle: string;
}

export const ACHETEURS_DEFENSE: AcheteurDefense[] = [
  // === Entrées génériques pour les ministères/grandes entités ===
  { id: 'minarm', code: 'MINARM', nom: 'Ministère des Armées', tutelle: 'MINARM' },
  { id: 'dga', code: 'DGA', nom: 'Direction Générale de l\'Armement', tutelle: 'DGA' },
  { id: 'marine-nationale', code: 'MARINE', nom: 'Marine Nationale', tutelle: 'Marine Nationale' },
  { id: 'armee-terre', code: 'ADT', nom: 'Armée de Terre', tutelle: 'Armée de Terre' },
  { id: 'armee-air', code: 'AAE', nom: 'Armée de l\'Air et de l\'Espace', tutelle: 'Armée de l\'Air' },

  // === MINARM - Ministère des armées ===
  { id: 'amiad', code: 'AMIAD', nom: 'Agence Ministérielle pour l\'Intelligence Artificielle de Défense', tutelle: 'MINARM' },
  { id: 'bcrm-brest', code: 'BCRM', nom: 'BCRM de BREST - CMOB Division finances - Bureau marchés', tutelle: 'Marine Nationale' },
  { id: 'cabsdc', code: 'CABSDC', nom: 'Sous direction des cabinets', tutelle: 'MINARM' },

  // === CND - Commissariat au Numérique de Défense ===
  { id: 'cnd', code: 'CND', nom: 'Commissariat au Numérique de Défense', tutelle: 'CND' },
  { id: 'bnmr-balard', code: 'BNMR Balard', nom: 'CND/DAN Z IST - Bureau marchés de Balard', tutelle: 'CND' },
  { id: 'bnmr-brest', code: 'BNMR Brest', nom: 'CND/DAN Z MANCHE ATLANTIQUE - BNMR Brest', tutelle: 'CND' },
  { id: 'bnmr-idf', code: 'BNMR IDF', nom: 'CND/DAN IDF', tutelle: 'CND' },
  { id: 'bnmr-toulon', code: 'BNMR Toulon', nom: 'CND/DAN Z SUD - BNMR Toulon', tutelle: 'CND' },
  { id: 'cnso-orleans', code: 'CNSO Orléans', nom: 'CND/DAN2 ORLEANS Centre National de Soutien Opérationnel - C.N.S.O.', tutelle: 'CND' },

  // === DGA / AND - Agence du Numérique de Défense ===
  { id: 'dga-and', code: 'DGA/AND', nom: 'AGENCE DU NUMERIQUE DE DEFENSE', tutelle: 'DGA' },

  // === DGA / DO / S2A / PROD - S2A ===
  { id: 'da-ba', code: 'DA-BA', nom: 'Division achats - Toulouse/Balma', tutelle: 'DGA' },
  { id: 'da-bd', code: 'DA-BD', nom: 'Division achats - Balard', tutelle: 'DGA' },
  { id: 'da-bs', code: 'DA-BS', nom: 'Division achats - Bourges', tutelle: 'DGA' },
  { id: 'da-bz', code: 'DA-BZ', nom: 'Division achats - Brest', tutelle: 'DGA' },

  // === DA-IDFN - Division achats - Ile de France/Normandie ===
  { id: 'da-idfn-sy', code: 'DA-IDFN-SY', nom: 'Site Saclay', tutelle: 'DGA' },
  { id: 'da-idfn-vdr', code: 'DA-IDFN-VDR', nom: 'Site Val de Reuil', tutelle: 'DGA' },
  { id: 'da-idfn-vlp', code: 'DA-IDFN-VLP', nom: 'Site Vert le Petit', tutelle: 'DGA' },

  // === DA-SE - Division achats - Sud-Est ===
  { id: 'da-se-is', code: 'DA-SE-IS', nom: 'Site Istres', tutelle: 'DGA' },
  { id: 'da-se-tn', code: 'DA-SE-TN', nom: 'Site Toulon', tutelle: 'DGA' },

  // === DA-SO - Division achats - Sud-Ouest ===
  { id: 'da-so-be', code: 'DA-SO-BE', nom: 'Site Landes', tutelle: 'DGA' },

  // === DGA / DT / SCAT ===
  { id: 'dga-dt-scat', code: 'DGA/DT/SCAT', nom: 'Direction Technique / Service centralisé des achats techniques', tutelle: 'DGA' },

  // === DGA IS - DGA Information stratégique ===
  { id: 'dga-is', code: 'DGA IS', nom: 'DGA Information stratégique', tutelle: 'DGA' },

  // === DMAé - Direction de la maintenance aéronautique ===
  { id: 'dmae', code: 'DMAé', nom: 'Direction de la maintenance aéronautique', tutelle: 'DMAé' },
  { id: 'ssam-33504-beauzelle', code: 'SSAM 33 504', nom: 'Structure Spécialisée d\'Achat et de Mandatement 33 504 (Beauzelle)', tutelle: 'DMAé' },
  { id: 'ssam-33503-bordeaux', code: 'SSAM 33503', nom: 'Structure Spécialisée d\'Achat et de Mandatement 33 503 Bordeaux', tutelle: 'DMAé' },

  // === ESTM - Établissements sous tutelle ministérielle ===
  { id: 'eae', code: 'EAE', nom: 'ECOLE DE L\'AIR ET DE L\'ESPACE', tutelle: 'Enseignement' },
  { id: 'ecpad', code: 'ECPAD', nom: 'AGENCE D\'IMAGE DE LA DEFENSE', tutelle: 'MINARM' },
  { id: 'cbdd-bordeaux-merignac', code: 'EPA/CBDD Bordeaux-Mérignac', nom: 'Cercle de la base de défense de Bordeaux-Mérignac', tutelle: 'Bases de Défense' },
  { id: 'cbdd-brest', code: 'EPA/CBDD BREST', nom: 'CERCLE DE LA BASE DE DEFENSE DE BREST-LORIENT', tutelle: 'Bases de Défense' },
  { id: 'cbdd-reve', code: 'EPA/CBDD Rêve', nom: 'CERCLE de la Base de Défense de RÊVE', tutelle: 'Bases de Défense' },
  { id: 'cbdd-cazaux', code: 'EPA/CBDD Cazaux', nom: 'Cercle Base de Défense Cazaux', tutelle: 'Bases de Défense' },
  { id: 'cbdd-cherbourg', code: 'EPA/CBDD CHERBOURG', nom: 'Cercle de la base de défense de Cherbourg', tutelle: 'Bases de Défense' },
  { id: 'cbdd-montauban-agen', code: 'EPA/CBDD Montauban-Agen', nom: 'Cercle de la base de défense Montauban Agen', tutelle: 'Bases de Défense' },
  { id: 'cbdd-nancy', code: 'EPA/CBDD Nancy', nom: 'Cercle de la Base de Défense de Nancy', tutelle: 'Bases de Défense' },
  { id: 'cbdd-pau', code: 'EPA/CBDD PAU', nom: 'Cercle de la BdD de Pau, Bayonne, Tarbes', tutelle: 'Bases de Défense' },
  { id: 'cbdd-bret-sce', code: 'EPA/CBDD BRET SCE', nom: 'Cercle de la base de défense IDF Rattaché St-Cyr l\'Ecole', tutelle: 'Bases de Défense' },
  { id: 'cbdd-rochefort-cognac', code: 'EPA/CBDD Rochefort-Cognac', nom: 'Cercle de la Base de Défense de Rochefort - Cognac', tutelle: 'Bases de Défense' },
  { id: 'cbdd-strasbourg-haguenau', code: 'EPA/CBDD Strasbourg Haguenau', nom: 'Cercle de la Base de Défense de Strasbourg-Haguenau', tutelle: 'Bases de Défense' },
  { id: 'cbdd-toulon', code: 'EPA/CBDD Toulon', nom: 'Cercle de la base de défense de Toulon', tutelle: 'Bases de Défense' },
  { id: 'cbdd-toulouse', code: 'EPA/CBDD Toulouse', nom: 'Cercle de la BdD de Toulouse', tutelle: 'Bases de Défense' },
  { id: 'cbdd-tours', code: 'EPA/CBDD Tours', nom: 'Cercle unique de la base de défense de Tours', tutelle: 'Bases de Défense' },
  { id: 'cbdd-bdd-ams', code: 'EPA/Cercle BdD AMS', nom: 'Cercle de la base de défense d\'Angers - Le Mans - Saumur', tutelle: 'Bases de Défense' },
  { id: 'cbdd-besancon', code: 'EPA/Cercle de la BdD BESANCON', nom: 'Cercle de la Base de défense de BESANCON', tutelle: 'Bases de Défense' },
  { id: 'cgsbdd-saint-germain-en-laye', code: 'EPA/CGSBDD de Saint-Germain-en-Laye', nom: 'Cercle du groupement de soutien de base de défense de Saint-Germain-en-Laye', tutelle: 'Bases de Défense' },
  { id: 'cia-dan', code: 'EPA/CIA DAN', nom: 'Cercle Interarmées d\'Orléans-Bricy', tutelle: 'Bases de Défense' },
  { id: 'cm-cyr', code: 'EPA/CM/CYR', nom: 'cercle mixte (CGFM)', tutelle: 'Bases de Défense' },
  { id: 'cmbdd-mont-de-marsan', code: 'EPA/CM BDD de Mont de Marsan', nom: 'Cercle mixte de la Base de défense de Mont de Marsan', tutelle: 'Bases de Défense' },
  { id: 'cmbdd-draguignan', code: 'EPA/CM BDD Draguignan', nom: 'Cercle mixte de la Base de Défense de Draguignan', tutelle: 'Bases de Défense' },
  { id: 'cmbdd-mourmelon-mailly', code: 'EPA/CM BDD Mourmelon-Mailly', nom: 'Cercle mixte de la Base de Défense de Mourmelon-Mailly', tutelle: 'Bases de Défense' },
  { id: 'cmbdd-metz', code: 'EPA/CM BDD METZ', nom: 'Cercle de la Base de Défense de METZ', tutelle: 'Bases de Défense' },
  { id: 'cmle', code: 'EPA/CMLE', nom: 'Cercle mixte de la Légion étrangère', tutelle: 'Armée de Terre' },
  { id: 'cm-rennes', code: 'EPA/CM Rennes', nom: 'Cercle Militaire de la base de défense de Rennes', tutelle: 'Bases de Défense' },
  { id: 'cm-bmt', code: 'EPA/CM BMT', nom: 'Cercle Mess du BMT', tutelle: 'Bases de Défense' },
  { id: 'cmt', code: 'EPA/CMT', nom: 'Cercle mixte de la caserne des Tourelles', tutelle: 'Bases de Défense' },
  { id: 'cna', code: 'EPA/CNA', nom: 'Cercle National des Armées', tutelle: 'MINARM' },
  { id: 'cnmss', code: 'EPA/CNMSS', nom: 'CAISSE NATIONALE MILITAIRE DE SECURITE SOCIALE', tutelle: 'MINARM' },
  { id: 'ecpad-etablissement', code: 'EPA/ECPAD', nom: 'Etablissement de Communication et de Production Audiovisuelles de la Défense', tutelle: 'MINARM' },
  { id: 'ecole-navale', code: 'EPA/EN', nom: 'Ecole Navale', tutelle: 'Marine Nationale' },
  { id: 'ensta-bretagne', code: 'EPA/ENSTA Bretagne', nom: 'Ecole Nationale Supérieure de Techniques Avancées Bretagne (ENSTA Bretagne)', tutelle: 'Enseignement' },
  { id: 'ensta-campus-brest', code: 'EPA/ENSTA Campus Brest', nom: 'Ecole Nationale Supérieure de Techniques Avancées - Campus Brest', tutelle: 'Enseignement' },
  { id: 'ensta-campus-paris-saclay', code: 'EPA/ENSTA Campus de Paris Saclay', nom: 'Ecole Nationale Supérieure de Techniques Avancées - Campus de Paris Saclay', tutelle: 'Enseignement' },
  { id: 'epfp', code: 'EPA/EPFP', nom: 'Etablissement public des Fonds de prévoyance militaire et de l\'aéronautique', tutelle: 'MINARM' },
  { id: 'fele', code: 'EPA/FELE', nom: 'Foyer d\'entraide de la Légion étrangère', tutelle: 'Armée de Terre' },
  { id: 'invalides', code: 'EPA/INI', nom: 'Institution nationale des Invalides', tutelle: 'MINARM' },
  { id: 'isae', code: 'EPA/ISAE', nom: 'Institut supérieur de l\'aéronautique et de l\'espace (ISAE)', tutelle: 'Enseignement' },
  { id: 'musee-air-espace', code: 'EPA/MAE', nom: 'Musée de l\'Air et de l\'Espace', tutelle: 'MINARM' },
  { id: 'musee-marine', code: 'EPA/MnM', nom: 'Musée national de la Marine', tutelle: 'Marine Nationale' },
  { id: 'musee-armee', code: 'EPA/Musée de l\'Armée', nom: 'Musée de l\'Armée', tutelle: 'MINARM' },
  { id: 'onacvg', code: 'EPA/ONACVG', nom: 'Office national des combattants et des victimes de guerre', tutelle: 'MINARM' },
  { id: 'scef', code: 'EPA/SCEF', nom: 'Service commun des anciens et des foyers', tutelle: 'MINARM' },
  { id: 'shom', code: 'EPA/SHOM', nom: 'Service hydrographique et océanographique de la Marine', tutelle: 'Marine Nationale' },
  { id: 'ecole-polytechnique', code: 'EPSCP/Ecole Polytechnique', nom: 'Ecole Polytechnique', tutelle: 'Enseignement' },
  { id: 'ip-paris', code: 'EPSCP/IP Paris', nom: 'Institut Polytechnique de Paris', tutelle: 'Enseignement' },
  { id: 'rrc-france', code: 'RRC FRANCE', nom: 'Rapid Reaction Corps - France', tutelle: 'MINARM' },

  // === Gendarmerie Nationale (ESTM / EPA) ===
  { id: 'cercle-mixte-egr', code: 'ESTM/EPA/Cercle mixte de l\'EGR', nom: 'Cercle mixte de l\'Ecole de gendarmerie de Rochefort', tutelle: 'Gendarmerie' },
  { id: 'cm-cnefg-st-astier', code: 'ESTM/EPA/CM CNEFG St-Astier', nom: 'Cercle mixte du centre national d\'entraînement des forces de gendarmerie', tutelle: 'Gendarmerie' },
  { id: 'cm-cnicg-gramat', code: 'ESTM/EPA/CM CNICG Gramat', nom: 'Cercle mixte du centre national d\'instruction cynophile de la gendarmerie', tutelle: 'Gendarmerie' },
  { id: 'cm-cnisag-chamonix', code: 'ESTM/EPA/CM CNISAG Chamonix', nom: 'Cercle mixte du centre national d\'instruction au ski et à l\'alpinisme de la gendarmerie', tutelle: 'Gendarmerie' },
  { id: 'cm-dggn-issy', code: 'ESTM/EPA/CM DGGN Issy-les-Moulineaux', nom: 'Cercle mixte de la direction générale de la gendarmerie nationale à Issy les Moulineaux', tutelle: 'Gendarmerie' },
  { id: 'cm-eg-chateaulin', code: 'ESTM/EPA/CM EG Châteaulin', nom: 'Cercle mixte de l\'école de gendarmerie de Châteaulin', tutelle: 'Gendarmerie' },
  { id: 'cm-eg-chaumont', code: 'ESTM/EPA/CM EG Chaumont', nom: 'Cercle mixte de l\'école de gendarmerie de Chaumont', tutelle: 'Gendarmerie' },
  { id: 'cm-eg-dijon', code: 'ESTM/EPA/CM EG Dijon', nom: 'Cercle mixte de l\'école de gendarmerie de Dijon', tutelle: 'Gendarmerie' },
  { id: 'cm-eg-fontainebleau', code: 'ESTM/EPA/CM EG Fontainebleau', nom: 'Cercle mixte de l\'école de gendarmerie de Fontainebleau', tutelle: 'Gendarmerie' },
  { id: 'cm-eg-montlucon', code: 'ESTM/EPA/CM EG Montluçon', nom: 'Cercle mixte de l\'école de gendarmerie de Montluçon', tutelle: 'Gendarmerie' },
  { id: 'cm-eg-tulle', code: 'ESTM/EPA/CM EG Tulle', nom: 'Cercle mixte de l\'école de gendarmerie de Tulle', tutelle: 'Gendarmerie' },
  { id: 'cm-eogn-melun', code: 'ESTM/EPA/CM EOGN Melun', nom: 'Cercle mixte de l\'école des officiers de la gendarmerie nationale', tutelle: 'Gendarmerie' },
  { id: 'cmg-orleans', code: 'ESTM/EPA/CMG Orléans', nom: 'Cercle mixte territorial de la gendarmerie d\'Orléans', tutelle: 'Gendarmerie' },
  { id: 'cmg-villeneuve-dascq', code: 'ESTM/EPA/CMG VILLENEUVE D\'ASCQ', nom: 'Cercle mixte territorial de Villeneuve d\'Ascq de la région de gendarmerie Nord-Pas-de-calais', tutelle: 'Gendarmerie' },

  // === GIP - Mission anniversaire ===
  { id: 'gip-80eme', code: 'GIP', nom: 'MISSION DU 80EME ANNIVERSAIRE DES DEBARQUEMENTS, DE LA LIBERATION DE LA FRANCE ET DE LA VICTOIRE', tutelle: 'MINARM' },

  // === SCA - Service du Commissariat des Armées ===
  { id: 'sca', code: 'SCA', nom: 'Service du Commissariat des Armées', tutelle: 'SCA' },
  { id: 'ambassade-irak', code: 'AMBASSADE IRAK', nom: 'AMBASSADE DE FRANCE EN IRAK', tutelle: 'SCA' },
  { id: 'ambassade-jordanie', code: 'AMBASSADE JORDANIE', nom: 'AMBASSADE DE FRANCE EN JORDANIE', tutelle: 'SCA' },
  { id: 'ambassade-rca', code: 'AMBASSADE REPUBLIQUE CENTRAFRICAINE', nom: 'AMBASSADE DE FRANCE EN REPUBLIQUE CENTRAFRICAINE', tutelle: 'SCA' },
  { id: 'cirl', code: 'CIRL', nom: 'Centre Interarmées du soutien restauration et loisirs', tutelle: 'SCA' },
  { id: 'dicom-gbffs', code: 'DICOM/GBFFS', nom: 'Direction du Commissariat et Groupement de Soutien de la base des Forces Françaises au Gabon', tutelle: 'SCA' },
  { id: 'dicom-djibouti', code: 'DICOM DJIBOUTI', nom: 'Direction du commissariat d\'outre-mer de Djibouti', tutelle: 'SCA' },
  { id: 'dicom-fazoi-mayotte', code: 'DICOM FAZOI et GSBdD REUNION MAYOTTE', nom: 'Direction du Commissariat Outre-Mer FAZOI et groupement de soutien de la Base de Défense Réunion-Mayotte', tutelle: 'SCA' },
  { id: 'dicom-ffci', code: 'DICOM FFCI', nom: 'Direction du commissariat d\'outre-mer des forces françaises en Côte d\'Ivoire', tutelle: 'SCA' },
  { id: 'dicom-dasen', code: 'DICOM DASEN', nom: 'Direction du commissariat d\'outre-mer et groupement de soutien de la base des éléments français au Sénégal', tutelle: 'SCA' },
  { id: 'dicom-nc', code: 'DICOM NC', nom: 'Direction du Commissariat d\'Outre-Mer de Nouvelle Calédonie', tutelle: 'SCA' },
  { id: 'dicom-pf', code: 'DICOM PF', nom: 'Direction du Commissariat Outre-Mer en Polynésie française', tutelle: 'SCA' },
  { id: 'dircom-barkhane', code: 'DIRCOM BARKHANE', nom: 'DIRECTION DU COMMISSARIAT EN OPERATION EXTERIEUR BARKHANE', tutelle: 'SCA' },
  { id: 'ambassade-burkina', code: 'AMBASSADE BURKINA', nom: 'AMBASSADE DE FRANCE DU BURKINA', tutelle: 'SCA' },
  { id: 'dircom-sangaris', code: 'DIRCOM SANGARIS', nom: 'Direction du commissariat en opération extérieurs SANGARIS', tutelle: 'SCA' },
  { id: 'gsbdd-dicom-guyane', code: 'GSBdD/DICOM Guyane', nom: 'Groupement de Soutien de la Base de Défense / Direction du Commissariat d\'Outre-Mer en Guyane', tutelle: 'SCA' },
  { id: 'minarm-dicom-antilles', code: 'MINARM/DICOM Antilles', nom: 'Ministère des Armées direction du commissariat d\'outre-mer aux Antilles', tutelle: 'SCA' },
  { id: 'pfat', code: 'PFAT', nom: 'Plate-forme affrètement et transport', tutelle: 'SCA' },
  { id: 'pfc-brest', code: 'PFC Brest', nom: 'Plate-forme commissariat Brest', tutelle: 'SCA' },

  // === PFC Est - Plate-forme commissariat Est (Metz) ===
  { id: 'gsbdd-belfort', code: 'GSBdD BELFORT', nom: 'Groupement de soutien de la Base de défense de BELFORT', tutelle: 'SCA' },
  { id: 'gsbdd-besancon', code: 'GSBdD BESANCON', nom: 'Groupement de soutien de la Base de défense de BESANCON', tutelle: 'SCA' },
  { id: 'gsbdd-dijon', code: 'GSBdD DIJON', nom: 'Groupement de soutien de la Base de défense de DIJON', tutelle: 'SCA' },
  { id: 'gsbdd-charleville-mezieres', code: 'GSBdD CHARLEVILLE-MEZIERES', nom: 'Groupement de soutien de la Base de défense de CHARLEVILLE - MEZIERES', tutelle: 'SCA' },
  { id: 'gsbdd-colmar', code: 'GSBdD COLMAR', nom: 'Groupement de soutien de la Base de défense de COLMAR', tutelle: 'SCA' },
  { id: 'gsbdd-creil', code: 'GSBdD Creil', nom: 'Groupement de soutien de la base de défense de Creil', tutelle: 'SCA' },
  { id: 'gsbdd-lille', code: 'GSBdD Lille', nom: 'Groupement de Soutien de la Base de Défense de Lille', tutelle: 'SCA' },
  { id: 'gsbdd-luxeuil-epinal', code: 'GSBdD LUXEUIL - EPINAL', nom: 'Groupement de soutien de la Base de défense LUXEUIL - EPINAL', tutelle: 'SCA' },
  { id: 'gsbdd-metz', code: 'GSBdD METZ', nom: 'Groupement de soutien de la Base de défense de METZ', tutelle: 'SCA' },
  { id: 'gsbdd-mourmelon-mailly', code: 'GSBdD MOURMELON - MAILLY', nom: 'Groupement de soutien de la Base de défense de MOURMELON - MAILLY', tutelle: 'SCA' },
  { id: 'gsbdd-nancy', code: 'GSBdD NANCY', nom: 'Groupement de soutien de la base de défense de Nancy', tutelle: 'SCA' },
  { id: 'gsbdd-phalsbourg', code: 'GSBdD PHALSBOURG', nom: 'Groupement de soutien de la base de défense de PHALSBOURG', tutelle: 'SCA' },
  { id: 'gsbdd-st-dizier-chaumont', code: 'GSBdD ST DIZIER - CHAUMONT', nom: 'Groupement de soutien de la Base de défense de ST DIZIER - CHAUMONT', tutelle: 'SCA' },
  { id: 'gsbdd-strasbourg-haguenau', code: 'GSBdD STRASBOURG - HAGUENAU', nom: 'Groupement de soutien de la Base de défense de STRASBOURG - HAGUENAU', tutelle: 'SCA' },
  { id: 'gsbdd-verdun', code: 'GSBdD VERDUN', nom: 'Groupement de soutien de la Base de défense de VERDUN', tutelle: 'SCA' },

  // === PFC Ouest - Plate-forme commissariat Ouest (Rennes) ===
  { id: 'gsbdd-angers-le-mans-saumur', code: 'GSBdD Angers-Le Mans-Saumur', nom: 'Groupement de Soutien de la Base de Défense d\'Angers - Le Mans - Saumur', tutelle: 'SCA' },
  { id: 'gsbdd-bourges-avord', code: 'GSBdD Bourges-Avord', nom: 'Groupement de soutien de la base de défense Bourges Avord', tutelle: 'SCA' },
  { id: 'gsbdd-cherbourg', code: 'GSBdD Cherbourg', nom: 'Groupement de Soutien de la Base de Défense de Cherbourg', tutelle: 'SCA' },
  { id: 'efq', code: 'EFQ', nom: 'Ecole des fourriers de Querqueville', tutelle: 'SCA' },
  { id: 'gsbdd-evreux', code: 'GSBdD Evreux', nom: 'Groupement de Soutien de la Base de Défense Evreux', tutelle: 'SCA' },
  { id: 'gsbdd-orleans-bricy', code: 'GSBdD Orléans Bricy', nom: 'Groupement de Soutien de la Base de Défense Orléans Bricy', tutelle: 'SCA' },
  { id: 'gsbdd-rennes', code: 'GSBdD Rennes', nom: 'Groupement de Soutien de la Base de Défense de Rennes', tutelle: 'SCA' },
  { id: 'gsbdd-tours', code: 'GSBdD Tours', nom: 'Groupement de Soutien de la Base de Défense de Tours', tutelle: 'SCA' },
  { id: 'gsbdd-vannes-coetquidan', code: 'GSBdD Vannes Coëtquidan', nom: 'Groupement de Soutien de la Base de Défense de Vannes - Coëtquidan', tutelle: 'SCA' },

  // === PFC Paris - Plate-forme commissariat Paris (Saint-Germain-en-Laye) ===
  { id: 'gsbdd-idf-pole-montlhery', code: 'GSBdD IDF/Pôle Montlhéry', nom: 'Pôle Montlhéry', tutelle: 'SCA' },
  { id: 'gsbdd-idf-pole-paris-ecole-militaire', code: 'GSBdD IDF/Pôle Paris Ecole Militaire', nom: 'Pôle Paris Ecole Militaire', tutelle: 'SCA' },
  { id: 'gsbdd-idf-pole-saint-germain-en-laye', code: 'GSBdD IDF/Pôle Saint Germain en Laye', nom: 'Pôle St Germain en Laye', tutelle: 'SCA' },
  { id: 'gsbdd-idf-pole-versailles', code: 'GSBdD IDF/Pôle Versailles', nom: 'Pôle Versailles', tutelle: 'SCA' },
  { id: 'gsbdd-idf-pole-villacoublay', code: 'GSBdD IDF/Pôle Villacoublay', nom: 'Pôle Villacoublay', tutelle: 'SCA' },
  { id: 'gsbdd-idf-pole-vincennes', code: 'GSBdD IDF/Pôle Vincennes', nom: 'Pôle Vincennes', tutelle: 'SCA' },

  // === PFC RBT - Plate-forme commissariat Rambouillet ===
  { id: 'ciec', code: 'CIEC', nom: 'Centre interarmées du soutien équipements commissariat', tutelle: 'SCA' },
  { id: 'cescon-antenne-navale', code: 'CESCON antenne navale', nom: 'Antenne navale du Centre d\'expertise du soutien du combattant et des forces', tutelle: 'SCA' },
  { id: 'cim', code: 'CIM', nom: 'Centre interarmées du soutien multiservices', tutelle: 'SCA' },

  // === PFC Sud - Plate-forme commissariat Sud (Toulon) ===
  { id: 'gsbdd-calvi', code: 'GSBdD Calvi', nom: 'Groupement de Soutien de la Base de Défense de Calvi', tutelle: 'SCA' },
  { id: 'gsbdd-carcassonne', code: 'GSBdD Carcassonne', nom: 'Groupement de soutien de la Base de défense Carcassonne', tutelle: 'SCA' },
  { id: 'gsbdd-draguignan', code: 'GSBdD Draguignan', nom: 'Groupement de soutien de la base de défense de Draguignan', tutelle: 'SCA' },
  { id: 'gsbdd-istres-salon', code: 'GSBdD Istres-Salon de Provence', nom: 'Groupement de Soutien de la Base de Défense ISTRES - SALON DE PROVENCE', tutelle: 'SCA' },
  { id: 'gsbdd-marseille-aubagne', code: 'GSBdD Marseille - Aubagne', nom: 'Groupement de Soutien de la Base de Défense Marseille-Aubagne', tutelle: 'SCA' },
  { id: 'gsbdd-montauban-agen', code: 'GSBdD Montauban - Agen', nom: 'Groupement de Soutien de la Base de Défense de Montauban - Agen', tutelle: 'SCA' },
  { id: 'gsbdd-nimes-orange-laudun', code: 'GSBdD Nîmes-Orange-Laudun', nom: 'Groupement de Soutien de la Base de Défense Nîmes-Orange Laudun', tutelle: 'SCA' },
  { id: 'gsbdd-st-christol', code: 'GSBdD St Christol', nom: 'Groupement de Soutien de la Base de Défense de St Christol', tutelle: 'SCA' },
  { id: 'gsbdd-toulon', code: 'GSBdD Toulon', nom: 'Groupement de Soutien de Bases de Défense de Toulon', tutelle: 'SCA' },
  { id: 'gsbdd-toulouse-castres', code: 'GSBdD Toulouse-Castres', nom: 'Groupement de Soutien de la Base de Défense de Toulouse - Castres', tutelle: 'SCA' },
  { id: 'gsbdd-ventiseri-solenzara', code: 'GSBdD Ventiseri Solenzara', nom: 'Groupement de soutien de la base de défense de Ventiseri-Solenzara', tutelle: 'SCA' },

  // === PFC Sud-Est - Plate-forme commissariat Sud-Est (Lyon) ===
  { id: 'gsbdd-clermont-ferrand', code: 'GSBdD Clermont-Ferrand', nom: 'Groupement de Soutien de la Base de Défense de Clermont-Ferrand', tutelle: 'SCA' },
  { id: 'gsbdd-gap', code: 'GSBdD Gap', nom: 'Groupement de Soutien de la Base de Défense de GAP', tutelle: 'SCA' },
  { id: 'gsbdd-grenoble-annecy-chambery', code: 'GSBdD Grenoble-Annecy-Chambéry', nom: 'Groupement de Soutien de la Base de Défense de Grenoble-Annecy-Chambéry', tutelle: 'SCA' },
  { id: 'gsbdd-la-valbonne', code: 'GSBdD La Valbonne', nom: 'Groupement de soutien de la base de défense de LA VALBONNE', tutelle: 'SCA' },
  { id: 'gsbdd-lyon-valence-la-valbonne', code: 'GSBdD LVV', nom: 'Groupement de Soutien de la Base de Défense de Lyon-Valence-la Valbonne', tutelle: 'SCA' },
  { id: 'gsbdd-valence', code: 'GSBdD Valence', nom: 'Groupement de Soutien de la Base de Défense de Valence', tutelle: 'SCA' },

  // === PFC Sud-Ouest - Plate-forme commissariat Sud-Ouest (Bordeaux) ===
  { id: 'gsbdd-angouleme', code: 'GSBdD Angoulême', nom: 'Groupement de Soutien de la Base de Défense d\'Angoulême', tutelle: 'SCA' },
  { id: 'gsbdd-bordeaux', code: 'GSBdD Bordeaux', nom: 'Groupement de Soutien de la Base de Défense Bordeaux', tutelle: 'SCA' },
  { id: 'gsbdd-brive', code: 'GSBdD Brive', nom: 'Groupement de Soutien de la Base de Défense de Brive', tutelle: 'SCA' },
  { id: 'gsbdd-cazaux', code: 'GSBdD Cazaux', nom: 'Groupement de Soutien de la Base de Défense Cazaux', tutelle: 'SCA' },
  { id: 'gsbdd-mont-de-marsan', code: 'GSBdD Mont de Marsan', nom: 'Groupement de Soutien de la Base de Défense Mont de Marsan', tutelle: 'SCA' },
  { id: 'gsbdd-pau', code: 'GSBdD Pau', nom: 'Groupement de Soutien de la Base de Défense de Pau', tutelle: 'SCA' },
  { id: 'gsbdd-poitiers-st-maixent', code: 'GSBdD Poitiers-St Maixent', nom: 'Groupement de Soutien de la Base de Défense de Poitiers - St Maixent', tutelle: 'SCA' },
  { id: 'gsbdd-rochefort-cognac-saintes', code: 'GSBdD Rochefort-Cognac-Saintes', nom: 'Groupement de Soutien de la Base de Défense Rochefort-Cognac-Saintes', tutelle: 'SCA' },

  // === SEO - Service de l'Énergie Opérationnelle ===
  { id: 'seo', code: 'SEO', nom: 'Service de l\'Énergie Opérationnelle', tutelle: 'SEO' },
  { id: 'bpia', code: 'BPIA', nom: 'Chalon sur Saone - dénivré - Base Pétrolière Interarmées - Chalon sur Saone', tutelle: 'SEO' },
  { id: 'cetso', code: 'CETSO', nom: 'Centre d\'expertise technique au service de l\'énergie opérationnelle - CETSO', tutelle: 'SEO' },
  { id: 'csta', code: 'CSTA', nom: 'Centre de soutien technique et administratif', tutelle: 'SEO' },
  { id: 'csta-infra', code: 'CSTA / INFRA', nom: 'CSTA / Infrastructure', tutelle: 'SEO' },
  { id: 'csta-ipge', code: 'CSTA / IPGE', nom: 'CSTA / Ingrédients produits divers et emballages', tutelle: 'SEO' },
  { id: 'csta-mat', code: 'CSTA / MAT', nom: 'CSTA / Matériels', tutelle: 'SEO' },
  { id: 'csta-pp', code: 'CSTA / PP', nom: 'CSTA Produits pétroliers', tutelle: 'SEO' },
  { id: 'dlsea-emm-detarre', code: 'DLSEA - EMM -détarré', nom: 'Détachement de liaison du SEA auprès de la Marine clôturé le 29/06/2021', tutelle: 'SEO' },

  // === Services Communs ===
  { id: 'services-communs-51', code: 'Services Communs', nom: 'Case n°51', tutelle: 'MINARM' },
  { id: 'services-communs-cs-21623', code: 'Services Communs / CS 21623', nom: 'Case 44', tutelle: 'MINARM' },
  { id: 'dicod', code: 'Services Communs / DICOD', nom: 'Délégation à l\'information et à la Communication de la Défense', tutelle: 'MINARM' },
  { id: 'siem-g', code: 'Services Communs / SIEM-G', nom: 'SIEM-G', tutelle: 'MINARM' },

  // === SGA - Secrétariat Général pour l'Administration ===
  { id: 'cmg-bordeaux', code: 'SGA / DRH-MD / CMG de Bordeaux', nom: 'Centre Ministériel de Gestion de Bordeaux', tutelle: 'SGA' },
  { id: 'defmob', code: 'SGA / DRH-MD / DM', nom: 'Défense mobilité - DM - DEFMOB', tutelle: 'SGA' },
  { id: 'sdpamg', code: 'SGA / SDPAMG', nom: 'Sous-Direction chargée de la préfiguration agence ministérielle de gestion - SDPAMG', tutelle: 'SGA' },
  { id: 'shd', code: 'SGA / SHD', nom: 'Service Historique de la Défense - SHD', tutelle: 'SGA' },

  // === SGA / DSNJ - Direction du Service National et de la Jeunesse ===
  { id: 'dsnj', code: 'SGA / DSNJ', nom: 'Direction du Service National et de la Jeunesse - DSNJ', tutelle: 'SGA' },
  { id: 'esn-idf', code: 'ESN IDF', nom: 'Établissement du service national d\'Ile de France - ESN IDF', tutelle: 'SGA' },
  { id: 'esn-ne', code: 'ESN NE', nom: 'Établissement du service national Nord-Est - ESN NE', tutelle: 'SGA' },
  { id: 'esn-no', code: 'ESN NO', nom: 'Établissement du service national Nord-Ouest - ESN NO', tutelle: 'SGA' },
  { id: 'esn-se', code: 'ESN SE', nom: 'Établissement du service national Sud-Est - ESN SE', tutelle: 'SGA' },
  { id: 'esn-so', code: 'ESN SO', nom: 'Établissement du service national Sud-Ouest - ESN SO', tutelle: 'SGA' },

  // === SGA / SID - Service d'Infrastructure de la Défense ===
  { id: 'sid-dcsid', code: 'SGA / SID', nom: 'Service d\'Infrastructure de la Défense - DCSID', tutelle: 'SID' },
  { id: 'ac-mmo-sid-sni', code: 'AC MMO SID - SNI', nom: 'Accord-Cadre Mandat de Maîtrise d\'Ouvrage au profit du SID', tutelle: 'SID' },
  { id: 'cetid', code: 'CETID', nom: 'Centre d\'Études Techniques d\'Infrastructure de la Défense - CETID', tutelle: 'SID' },
  { id: 'did-cayenne', code: 'DID Cayenne', nom: 'Direction d\'infrastructure de la défense de Cayenne - DID Cayenne', tutelle: 'SID' },
  { id: 'did-dakar', code: 'DID Dakar', nom: 'Direction d\'infrastructure de la défense de Dakar - DID Dakar', tutelle: 'SID' },
  { id: 'did-djibouti', code: 'DID Djibouti', nom: 'Direction d\'infrastructure de la défense à Djibouti - DID Djibouti', tutelle: 'SID' },
  { id: 'did-fdf', code: 'DID FdF', nom: 'Direction d\'infrastructure de la défense de Fort de France - DID Fort de France', tutelle: 'SID' },
  { id: 'did-rwanda', code: 'DID PANA', nom: 'Direction d\'infrastructure de la défense de Nouméa - DID Rwanda', tutelle: 'SID' },
  { id: 'did-papeete', code: 'DID Papéete', nom: 'Direction d\'infrastructure de la défense de Papéete - DID Papéete', tutelle: 'SID' },
  { id: 'did-sos', code: 'DID SOS', nom: 'Direction d\'infrastructure de la défense de Saint-Denis - DID Saint Denis', tutelle: 'SID' },
  { id: 'sid-ami', code: 'SID AMI', nom: 'ACADEMIE MINISTERIELLE DE L\'INFRASTRUCTURE (AMI)', tutelle: 'SID' },

  // === SID Atlantique - Service d'Infrastructure de la défense Atlantique ===
  { id: 'sid-atlantique', code: 'SID Atlantique', nom: 'Service d\'Infrastructure de la défense Atlantique', tutelle: 'SID' },
  { id: 'esid-brest-sam', code: 'ESID DE BREST - SAM', nom: 'ESID BREST - SOCIETE D\'AMENAGEMENT DU FINISTERE - Mandat de maîtrise d\'ouvrage - bâtiment logement 2AB', tutelle: 'SID' },
  { id: 'esid-brest-sonergia', code: 'ESID BREST - SONERGIA', nom: 'SONERGIA - Mandat de maîtrise d\'ouvrage', tutelle: 'SID' },
  { id: 'esid-brest-verifica', code: 'ESID DE BREST - VERIFICA', nom: 'VERIFICA - Mandat de maîtrise d\'ouvrage', tutelle: 'SID' },

  // === SID EPN - SID - Expertise et production nationale ===
  { id: 'sid-epn', code: 'SID EPN', nom: 'SID - Expertise et production nationale', tutelle: 'SID' },
  { id: 'amo-crescendo', code: 'AMO', nom: 'CRESCENDO CONSEIL', tutelle: 'SID' },
  { id: 'mmo-oteis', code: 'Mandat de maîtrise d\'ouvrage', nom: 'OTEIS', tutelle: 'SID' },

  // === SID IDF - Service d'Infrastructure de la défense Ile de France ===
  { id: 'sid-idf', code: 'SID IDF', nom: 'Service d\'Infrastructure de la défense Ile de France', tutelle: 'SID' },
  { id: 'agri-management-ac-moud', code: 'A.G.R.I Management - AC MOUD', nom: 'Réhabilitation de bâtiments d\'hébergement militaire - A.G.R.I ASSISTANCE GESTION ET REALISATION IMMOBILIERES', tutelle: 'SID' },
  { id: 'citallios-ac-moud', code: 'CITALLIOS - AC MOUD', nom: 'Réhabilitation de bâtiments d\'hébergement militaire - CITALLIOS', tutelle: 'SID' },
  { id: 'esid-bdf-citallios', code: 'ESID bdf - CITALLIOS', nom: 'MMO pour la construction aux mess à ARCUEIL - CITALLIOS', tutelle: 'SID' },
  { id: 'pi-ba-ac-moud', code: 'PI.B.A - AC MOUD', nom: 'Réhabilitation de bâtiments d\'hébergement militaire - PROJETS EN INGENIERIE DU BATIMENT ET AMENAGEMENT', tutelle: 'SID' },

  // === SID MED - Service d'Infrastructure de la défense Méditerranée ===
  { id: 'sid-med', code: 'SID MED', nom: 'Service d\'Infrastructure de la défense Méditerranée - SID MED', tutelle: 'SID' },
  { id: 'esid-toulon-mmo', code: 'ESID Toulon - MMO', nom: 'SRIG INGENIEURS CONSEILS ASSOCIES', tutelle: 'SID' },
  { id: 'saem-vad', code: 'SAEM VAD', nom: 'VAR AMENAGEMENT DEVELOPPEMENT SAEM VAD', tutelle: 'SID' },

  // === SID NE - Service d'Infrastructure de la défense Nord-Est ===
  { id: 'sid-ne', code: 'SID NE', nom: 'Service d\'Infrastructure de la défense Nord-Est', tutelle: 'SID' },
  { id: 'esid-metz-samop', code: 'ESID METZ - SAMOP', nom: 'Société d\'assistance à maîtrise d\'ouvrage publique', tutelle: 'SID' },
  { id: 'mmo-solorem', code: 'Mandat de maîtrise d\'ouvrage', nom: 'SOLOREM', tutelle: 'SID' },
  { id: 'sebl', code: 'SEBL', nom: 'SEBL GRAND EST', tutelle: 'SID' },
  { id: 'sedia', code: 'SEDIA', nom: 'SEDIA', tutelle: 'SID' },
  { id: 'sem-val-bourgogne', code: 'SEM Val de Bourgogne', nom: 'SOCIETE D\'ECONOMIE MIXTE D\'AMENAGEMENT ET DE DEVELOPPEMENT DU VAL DE BOURGOGNE', tutelle: 'SID' },

  // === SID Nord-Ouest - Service d'Infrastructure de la défense Nord-Ouest ===
  { id: 'sid-nord-ouest', code: 'SID Nord-Ouest', nom: 'Service d\'Infrastructure de la défense Nord-Ouest', tutelle: 'SID' },
  { id: 'esid-rennes-mou', code: 'ESID Rennes', nom: 'Délégation de maîtrise d\'ouvrages (MOU) - Délégation de maîtrise d\'ouvrage IMOU', tutelle: 'SID' },
  { id: 'esid-rennes-mmo-crescendo', code: 'ESID Rennes / MMO CRESCENDO', nom: 'MANDAT DE MAITRISE D\'OEUVRE - CRESCENDO', tutelle: 'SID' },

  // === SID Sud-Est - Service d'Infrastructure de la défense Sud-Est ===
  { id: 'sid-sud-est', code: 'SID Sud-Est', nom: 'Service d\'Infrastructure de la défense Sud-Est', tutelle: 'SID' },

  // === SID Sud-Ouest - Service d'Infrastructure de la défense Sud-Ouest ===
  { id: 'sid-sud-ouest', code: 'SID Sud-Ouest', nom: 'Service d\'Infrastructure de la défense Sud-Ouest', tutelle: 'SID' },
  { id: 'crescendo-so', code: 'CRESCENDO S.O.', nom: 'Marché de mandat de maîtrise d\'ouvrage pour la réhabilitation d\'un bâtiment hébergement - ESID Bordeaux', tutelle: 'SID' },
  { id: 'esid-bordeaux-mou', code: 'ESID Bordeaux', nom: 'Délégation de maîtrise d\'ouvrages (MOU) - ESID Bordeaux - service annexe', tutelle: 'SID' },

  // === SIAé - SERVICE INDUSTRIEL DE L'AÉRONAUTIQUE ===
  { id: 'siae', code: 'SIAé', nom: 'SERVICE INDUSTRIEL DE L\'AÉRONAUTIQUE', tutelle: 'SIAé' },
  { id: 'aia-amberieu', code: 'AIA Ambérieu', nom: 'Atelier Industriel de l\'Aéronautique d\'Ambérieu-en-Bugey - AIA Ambérieu', tutelle: 'SIAé' },
  { id: 'aia-bordeaux', code: 'AIA Bordeaux', nom: 'Atelier Industriel de l\'Aéronautique de Bordeaux - AIA Bordeaux', tutelle: 'SIAé' },
  { id: 'aia-bretagne', code: 'AIA Bretagne', nom: 'Atelier Industriel de l\'Aéronautique de Bretagne - AIA Bretagne', tutelle: 'SIAé' },
  { id: 'aia-clermont-ferrand', code: 'AIA Clermont Ferrand', nom: 'Atelier Industriel de l\'Aéronautique de Clermont-Ferrand - AIA Clermont-Ferrand', tutelle: 'SIAé' },
  { id: 'aia-cuers-pierrefeu', code: 'AIA Cuers Pierrefeu', nom: 'Atelier Industriel de l\'Aéronautique de Cuers-Pierrefeu - AIA Cuers-Pierrefeu', tutelle: 'SIAé' },

  // === SIMMT - Structure Intégrée du Maintien en condition opérationnelle du Matériel Terrestres ===
  { id: 'simmt', code: 'SIMMT', nom: 'Structure Intégrée du Maintien en condition opérationnelle du Matériel Terrestres', tutelle: 'SIMMT' },
  { id: 'ddc', code: 'DDC', nom: 'SERVICES DE L\'ETAT POUR LA FACTURATION ELECTRONIQUE', tutelle: 'SIMMT' },
  { id: 'dsn', code: 'DSN', nom: 'SDFSCSSN', tutelle: 'SIMMT' },
  { id: 'dtl', code: 'DTL', nom: 'Division technique et logistique', tutelle: 'SIMMT' },
  { id: 'sdbfc', code: 'SDBFC', nom: 'Sous-direction budget finances et comptabilité / SDBFC', tutelle: 'SIMMT' },

  // === SIMU - Service interarmées des munitions ===
  { id: 'simu', code: 'SIMU', nom: 'Service interarmées des munitions', tutelle: 'SIMU' },

  // === SMITer - Service de la Maintenance Industrielle Terrestre ===
  { id: 'smiter', code: 'SMITer', nom: 'Service de la Maintenance Industrielle Terrestre', tutelle: 'SMITer' },
  { id: '12eme-bsmat-neuvy-pailloux', code: '12ème BSMAT NEUVY PAILLOUX', nom: '12ème base de soutien du matériel de l\'armée de terre / 12ème BSMAT NEUVY PAILLOUX', tutelle: 'SMITer' },
  { id: '13eme-bsmat-det-moulins', code: '13ème BSMAT - Dét. Moulins - A.SAR', nom: '13ème base de soutien du matériel de l\'armée de terre - Détachement de Moulins - Antenne Section achats réactifs', tutelle: 'SMITer' },

  // === SSA - Service de Santé des Armées ===
  { id: 'ssa', code: 'SSA', nom: 'Service de Santé des Armées', tutelle: 'SSA' },
  { id: 'dapsa', code: 'DAPSA', nom: 'Direction des Approvisionnements en produits de santé des armées', tutelle: 'SSA' },

  // === SSF - Service de soutien de la flotte ===
  { id: 'ssf', code: 'SSF', nom: 'Service de soutien de la flotte', tutelle: 'Marine Nationale' },
  { id: 'dssf-brest', code: 'DSSF Brest', nom: 'Direction du service de soutien de la flotte de Brest - DSSF Brest', tutelle: 'Marine Nationale' },
  { id: 'dssf-toulon', code: 'DSSF Toulon', nom: 'Direction du service de soutien de la flotte de Toulon - DSSF Toulon', tutelle: 'Marine Nationale' },
  { id: 'ssf-antilles', code: 'SSF Antilles', nom: 'Service de soutien de la flotte Antilles', tutelle: 'Marine Nationale' },
  { id: 'ssf-la-reunion', code: 'SSF La Réunion', nom: 'Service de soutien de la flotte de la Réunion', tutelle: 'Marine Nationale' },
  { id: 'ssf-noumea', code: 'SSF Nouméa', nom: 'Service de soutien de la flotte Nouméa', tutelle: 'Marine Nationale' },
  { id: 'ssf-papeete', code: 'SSF Papeete', nom: 'Service de soutien de la flotte Papeete', tutelle: 'Marine Nationale' },

  // === STAT - Section Technique de l'Armée de Terre ===
  { id: 'stat', code: 'STAT', nom: 'Section Technique de l\'Armée de Terre', tutelle: 'Armée de Terre' },
];

// Fonction utilitaire pour obtenir le nom BOAMP
export function getBoampName(acheteur: AcheteurDefense): string {
  return acheteur.nom;
}

// Obtenir les tutelles uniques
export function getTutelles(): string[] {
  const tutelles = new Set(ACHETEURS_DEFENSE.map(a => a.tutelle));
  return Array.from(tutelles).sort();
}

// Filtrer par tutelle
export function filterByTutelle(tutelle: string): AcheteurDefense[] {
  return ACHETEURS_DEFENSE.filter(a => a.tutelle === tutelle);
}

// Rechercher un acheteur par nom (recherche partielle)
export function searchAcheteur(query: string): AcheteurDefense[] {
  const q = query.toLowerCase();
  return ACHETEURS_DEFENSE.filter(a =>
    a.nom.toLowerCase().includes(q) ||
    a.code.toLowerCase().includes(q)
  );
}

// Obtenir tous les noms pour requêtes BOAMP
export function getAllAcheteurNames(): string[] {
  return ACHETEURS_DEFENSE.map(a => a.nom);
}
