// Textes d'aide pour les formulaires DC1 et DC2
// Ces textes s'affichent au survol de l'icône d'aide (?) à côté de chaque champ

export const dc1HelpTexts = {
  // Section A - Acheteur
  acheteur: {
    nom: "Indiquez le nom complet de l'acheteur public : collectivité territoriale (mairie, département, région), établissement public, État, etc. Ce champ est obligatoire.",
    reference_avis: "Numéro de référence de l'avis de marché publié au BOAMP (Bulletin Officiel des Annonces de Marchés Publics) ou au JOUE (Journal Officiel de l'Union Européenne). Vous le trouverez dans l'avis de publicité.",
    reference_dossier: "Référence interne attribuée par l'acheteur au dossier de consultation des entreprises (DCE). Elle figure généralement en en-tête des documents de consultation.",
  },

  // Section B - Consultation
  consultation: {
    objet: "Décrivez précisément l'objet du marché tel qu'indiqué dans l'avis de publicité. Exemple : 'Mission de maîtrise d'œuvre pour la construction d'un groupe scolaire'.",
  },

  // Section C - Candidature
  candidature: {
    type: "Précisez si vous candidatez pour l'ensemble du marché (marché global) ou uniquement pour certains lots (lots spécifiques). Dans le second cas, listez les lots concernés.",
    lots: "Indiquez les numéros et intitulés des lots pour lesquels vous présentez votre candidature. Exemple : 'Lot 1 : Gros œuvre, Lot 3 : Électricité'.",
  },

  // Section D - Candidat
  candidat: {
    siret: "Le numéro SIRET (14 chiffres) permet de récupérer automatiquement les informations de votre entreprise via l'API Pappers : dénomination sociale, adresse, forme juridique, etc.",
    denomination_sociale: "Raison sociale officielle de votre entreprise telle qu'enregistrée au Registre du Commerce et des Sociétés (RCS). Ne pas confondre avec le nom commercial.",
    nom_commercial: "Nom sous lequel votre entreprise est connue du public, s'il diffère de la dénomination sociale. Laissez vide si identique.",
    adresse_siege: "Adresse du siège social de l'entreprise telle que déclarée au RCS. C'est l'adresse légale de l'entreprise.",
    adresse_etablissement: "Adresse de l'établissement concerné par la candidature, si différente du siège social. Utile si vous avez plusieurs établissements.",
    email: "Adresse email de contact pour les échanges relatifs à cette candidature. Une adresse professionnelle dédiée aux marchés publics est recommandée.",
    telephone: "Numéro de téléphone professionnel pour être contacté rapidement concernant votre candidature.",
    representant_nom: "Nom et prénom du représentant légal de l'entreprise ou de la personne habilitée à engager l'entreprise.",
    representant_qualite: "Fonction du représentant au sein de l'entreprise : Gérant, Président, Directeur Général, etc.",
  },

  // Section E - Groupement
  groupement: {
    type: "Groupement conjoint : chaque membre s'engage sur une partie distincte du marché. Groupement solidaire : chaque membre est engagé pour la totalité du marché.",
    mandataire: "Le mandataire (ou chef de file) représente le groupement auprès de l'acheteur. Il coordonne les cotraitants et est l'interlocuteur unique.",
  },

  // Membre du groupement
  membre: {
    siret: "Numéro SIRET du cotraitant. Permet de récupérer automatiquement ses informations via l'API Pappers.",
    denomination_sociale: "Raison sociale officielle du cotraitant telle qu'enregistrée au RCS.",
    adresse: "Adresse du siège social ou de l'établissement concerné du cotraitant.",
    email: "Email de contact du cotraitant pour les communications relatives au marché.",
    telephone: "Téléphone professionnel du cotraitant.",
    representant_nom: "Nom et prénom du représentant légal du cotraitant.",
    representant_qualite: "Fonction du représentant du cotraitant (Gérant, Président, etc.).",
  },

  // Section F - Engagements
  engagements: {
    attestation_marches_publics: "Déclaration sur l'honneur attestant que le candidat ne fait l'objet d'aucune exclusion des marchés publics (articles L.2141-1 à L.2141-5 et L.2141-7 à L.2141-11 du Code de la commande publique).",
    signature: "Signature électronique ou manuscrite du représentant légal. La signature engage l'entreprise sur l'exactitude des informations fournies.",
    date_signature: "Date à laquelle le formulaire est signé. Doit être antérieure ou égale à la date limite de remise des candidatures.",
    lieu_signature: "Ville où le formulaire est signé. Généralement le lieu du siège social de l'entreprise.",
  },
};

export const dc2HelpTexts = {
  // Section A - Identification
  identification: {
    siret: "Numéro SIRET à 14 chiffres identifiant de manière unique votre établissement auprès de l'INSEE.",
    siren: "Numéro SIREN à 9 chiffres identifiant votre entreprise (correspond aux 9 premiers chiffres du SIRET).",
    denomination_sociale: "Raison sociale officielle de l'entreprise inscrite au RCS.",
    nom_commercial: "Nom commercial de l'entreprise s'il diffère de la dénomination sociale.",
    adresse_siege: "Adresse complète du siège social de l'entreprise.",
    adresse_etablissement: "Adresse de l'établissement concerné si différente du siège.",
    email: "Adresse email professionnelle de contact.",
    telephone: "Numéro de téléphone professionnel.",
    fax: "Numéro de fax si disponible (optionnel).",
  },

  // Section B - Situation juridique
  situation_juridique: {
    forme_juridique: "Forme juridique de l'entreprise : SARL, SAS, SA, EURL, SNC, auto-entrepreneur, etc.",
    date_creation: "Date de création ou d'immatriculation de l'entreprise au RCS.",
    capital_social: "Montant du capital social de l'entreprise en euros. Obligatoire pour les sociétés de capitaux.",
    devise_capital: "Devise du capital social (généralement EUR pour les entreprises françaises).",
    numero_rcs: "Numéro d'inscription au Registre du Commerce et des Sociétés.",
    ville_rcs: "Ville du greffe du tribunal de commerce où l'entreprise est immatriculée.",
    numero_rm: "Numéro au Répertoire des Métiers (pour les artisans inscrits à la CMA).",
    code_naf: "Code NAF/APE à 4 chiffres + 1 lettre définissant l'activité principale de l'entreprise.",
    libelle_naf: "Libellé correspondant au code NAF décrivant l'activité principale.",
  },

  // Section C - Capacités économiques et financières
  capacites_economiques: {
    chiffre_affaires_global: "Chiffre d'affaires hors taxes réalisé sur les 3 derniers exercices comptables clos. Indicateur de la taille et de la santé financière de l'entreprise.",
    chiffre_affaires_domaine: "Chiffre d'affaires spécifique au domaine d'activité concerné par le marché. Permet d'évaluer votre expérience dans ce secteur.",
    assurance_rc_pro: "Numéro de police et nom de l'assureur pour la responsabilité civile professionnelle. Obligatoire pour de nombreux marchés.",
    assurance_decennale: "Numéro de police et nom de l'assureur pour la garantie décennale. Obligatoire pour les travaux de construction.",
  },

  // Section D - Capacités techniques et professionnelles
  capacites_techniques: {
    effectif_moyen: "Nombre moyen de salariés sur les 3 dernières années. Inclut CDI, CDD et intérimaires.",
    effectif_encadrement: "Nombre de cadres et personnel d'encadrement (ingénieurs, chefs de projet, etc.).",
  },

  // Références
  reference: {
    client: "Nom du client (maître d'ouvrage) pour lequel vous avez réalisé une prestation similaire.",
    objet: "Description de la mission ou des travaux réalisés. Précisez la nature et la complexité.",
    montant: "Montant HT du marché ou de la prestation. Permet d'évaluer l'échelle de vos réalisations.",
    annee: "Année de réalisation ou d'achèvement de la prestation.",
    contact: "Nom et coordonnées d'une personne référente chez le client pouvant attester de la bonne exécution.",
  },

  // Certifications
  certification: {
    nom: "Intitulé de la certification ou qualification (ex: ISO 9001, Qualibat, OPQIBI, etc.).",
    organisme: "Nom de l'organisme certificateur ou qualificateur.",
    date_validite: "Date d'expiration de la certification. Vérifiez qu'elle sera valide pendant la durée du marché.",
  },

  // Section E - Moyens techniques
  moyens_techniques: {
    equipements: "Listez les équipements techniques dont vous disposez : logiciels métier, matériel de mesure, véhicules, etc.",
    outillage: "Décrivez l'outillage et le matériel spécifique à votre activité que vous possédez ou louez.",
    locaux: "Décrivez vos locaux professionnels : bureaux, ateliers, entrepôts, avec leur superficie et localisation.",
  },
};
