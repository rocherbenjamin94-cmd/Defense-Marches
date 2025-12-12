import type { DC1FormData, DC2FormData } from '@/lib/dc1/types';

export interface ValidationError {
  field: string;
  message: string;
}

// Helper pour gérer les valeurs undefined/null
const safeString = (value: string | undefined | null): string => value ?? '';

export function validateDC1Form(data: DC1FormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Section A - Acheteur
  if (!safeString(data.acheteur?.nom).trim()) {
    errors.push({ field: 'acheteur.nom', message: "Le nom de l'acheteur est obligatoire" });
  }

  // Section B - Consultation
  if (!safeString(data.consultation?.objet).trim()) {
    errors.push({ field: 'consultation.objet', message: "L'objet de la consultation est obligatoire" });
  }

  // Section C - Candidature
  if (!data.candidature?.type) {
    errors.push({ field: 'candidature.type', message: 'Le type de candidature est obligatoire' });
  }
  if (data.candidature?.type === 'lots_specifiques' && !safeString(data.candidature?.lots).trim()) {
    errors.push({ field: 'candidature.lots', message: 'Veuillez préciser les lots concernés' });
  }

  // Section D - Candidat
  if (!data.candidat?.mode) {
    errors.push({ field: 'candidat.mode', message: 'Le mode de candidature est obligatoire' });
  }
  if (!safeString(data.candidat?.siret).trim()) {
    errors.push({ field: 'candidat.siret', message: 'Le SIRET est obligatoire' });
  } else if (!isValidSiret(data.candidat.siret)) {
    errors.push({ field: 'candidat.siret', message: 'Le SIRET est invalide' });
  }
  if (!safeString(data.candidat?.denomination_sociale).trim()) {
    errors.push({ field: 'candidat.denomination_sociale', message: 'La dénomination sociale est obligatoire' });
  }
  if (!safeString(data.candidat?.adresse_etablissement).trim()) {
    errors.push({ field: 'candidat.adresse_etablissement', message: "L'adresse de l'établissement est obligatoire" });
  }
  if (!safeString(data.candidat?.email).trim()) {
    errors.push({ field: 'candidat.email', message: "L'email est obligatoire" });
  }
  if (!safeString(data.candidat?.telephone).trim()) {
    errors.push({ field: 'candidat.telephone', message: 'Le téléphone est obligatoire' });
  }

  // Section E - Groupement (si applicable)
  if (data.candidat?.mode === 'groupement' && data.groupement) {
    if (!data.groupement.type) {
      errors.push({ field: 'groupement.type', message: 'Le type de groupement est obligatoire' });
    }
    if (!data.groupement.membres || data.groupement.membres.length === 0) {
      errors.push({ field: 'groupement.membres', message: 'Au moins un membre du groupement est requis' });
    }
    data.groupement.membres?.forEach((membre, index) => {
      if (!safeString(membre?.siret).trim()) {
        errors.push({ field: `groupement.membres.${index}.siret`, message: `SIRET du membre ${index + 1} obligatoire` });
      }
      if (!safeString(membre?.denomination_sociale).trim()) {
        errors.push({ field: `groupement.membres.${index}.denomination_sociale`, message: `Dénomination du membre ${index + 1} obligatoire` });
      }
    });
  }

  // Section F - Engagements
  if (!data.engagements?.attestation_exclusion) {
    errors.push({ field: 'engagements.attestation_exclusion', message: "L'attestation sur l'honneur doit être cochée" });
  }
  if (!data.engagements?.type_capacites) {
    errors.push({ field: 'engagements.type_capacites', message: 'Le mode de justification des capacités est obligatoire' });
  }

  return errors;
}

// Résultat de validation détaillé
export interface SiretValidationResult {
  valid: boolean;
  error?: string;
  cleaned?: string;
  digitCount: number;
  status: 'empty' | 'incomplete' | 'invalid_chars' | 'invalid_luhn' | 'valid';
}

export function validateSiretDetailed(siret: string): SiretValidationResult {
  // Nettoyer les espaces et tirets
  const cleaned = siret.replace(/[\s\-]/g, '');

  // Champ vide
  if (!cleaned) {
    return {
      valid: false,
      error: 'Veuillez saisir un SIRET',
      digitCount: 0,
      status: 'empty',
    };
  }

  // Caractères non numériques
  if (!/^\d*$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Le SIRET ne doit contenir que des chiffres',
      cleaned,
      digitCount: cleaned.replace(/\D/g, '').length,
      status: 'invalid_chars',
    };
  }

  // Nombre de chiffres incorrect
  if (cleaned.length < 14) {
    const missing = 14 - cleaned.length;
    return {
      valid: false,
      error: `Il manque ${missing} chiffre${missing > 1 ? 's' : ''} (${cleaned.length}/14)`,
      cleaned,
      digitCount: cleaned.length,
      status: 'incomplete',
    };
  }

  if (cleaned.length > 14) {
    return {
      valid: false,
      error: `Trop de chiffres (${cleaned.length}/14)`,
      cleaned: cleaned.slice(0, 14),
      digitCount: cleaned.length,
      status: 'invalid_chars',
    };
  }

  // Validation Luhn (algorithme de vérification)
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  if (sum % 10 !== 0) {
    return {
      valid: false,
      error: 'Ce SIRET est invalide (erreur de saisie ?)',
      cleaned,
      digitCount: 14,
      status: 'invalid_luhn',
    };
  }

  return {
    valid: true,
    cleaned,
    digitCount: 14,
    status: 'valid',
  };
}

export function isValidSiret(siret: string): boolean {
  return validateSiretDetailed(siret).valid;
}

export function isValidSiren(siren: string | undefined | null): boolean {
  if (!siren) return false;
  const cleaned = siren.replace(/\s/g, '');
  return /^\d{9}$/.test(cleaned);
}

export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string | undefined | null): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(\+33|0)[1-9]\d{8}$/.test(cleaned);
}

export function formatSiret(siret: string | undefined | null): string {
  if (!siret) return '';
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length !== 14) return siret;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
}

export function detectQueryType(query: string | undefined | null): 'siret' | 'siren' | 'nom' {
  if (!query) return 'nom';
  const cleaned = query.replace(/\s/g, '');
  if (/^\d{14}$/.test(cleaned)) return 'siret';
  if (/^\d{9}$/.test(cleaned)) return 'siren';
  return 'nom';
}

// =====================================================
// DC2 VALIDATION
// =====================================================

export function validateDC2Form(data: DC2FormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const safeStr = (value: string | undefined | null): string => value ?? '';

  // Section A - Identification
  if (!safeStr(data.identification?.siret).trim()) {
    errors.push({ field: 'identification.siret', message: 'Le SIRET est obligatoire' });
  } else if (!isValidSiret(data.identification.siret)) {
    errors.push({ field: 'identification.siret', message: 'Le SIRET est invalide' });
  }
  if (!safeStr(data.identification?.denomination_sociale).trim()) {
    errors.push({ field: 'identification.denomination_sociale', message: 'La dénomination sociale est obligatoire' });
  }
  if (!safeStr(data.identification?.adresse_etablissement).trim()) {
    errors.push({ field: 'identification.adresse_etablissement', message: "L'adresse de l'établissement est obligatoire" });
  }
  if (!safeStr(data.identification?.email).trim()) {
    errors.push({ field: 'identification.email', message: "L'email est obligatoire" });
  } else if (!isValidEmail(data.identification.email)) {
    errors.push({ field: 'identification.email', message: "L'email est invalide" });
  }
  if (!safeStr(data.identification?.telephone).trim()) {
    errors.push({ field: 'identification.telephone', message: 'Le téléphone est obligatoire' });
  }

  // Section B - Situation juridique
  if (!safeStr(data.situation_juridique?.forme_juridique).trim()) {
    errors.push({ field: 'situation_juridique.forme_juridique', message: 'La forme juridique est obligatoire' });
  }
  if (!safeStr(data.situation_juridique?.code_naf).trim()) {
    errors.push({ field: 'situation_juridique.code_naf', message: 'Le code NAF est obligatoire' });
  }

  // Section C - Capacités économiques (au moins un CA global renseigné)
  const hasCAGlobal = data.capacites_economiques?.chiffre_affaires_global?.some(
    (ca) => safeStr(ca?.montant).trim() !== ''
  );
  if (!hasCAGlobal) {
    errors.push({
      field: 'capacites_economiques.chiffre_affaires_global',
      message: 'Au moins un chiffre d\'affaires global est requis'
    });
  }

  // Section D - Capacités techniques (au moins un effectif renseigné)
  const hasEffectif = data.capacites_techniques?.effectifs?.some(
    (eff) => safeStr(eff?.nombre).trim() !== ''
  );
  if (!hasEffectif) {
    errors.push({
      field: 'capacites_techniques.effectifs',
      message: 'Au moins un effectif annuel est requis'
    });
  }

  // Validation des références (si présentes)
  data.capacites_techniques?.references?.forEach((ref, index) => {
    if (!safeStr(ref?.client).trim()) {
      errors.push({
        field: `capacites_techniques.references.${index}.client`,
        message: `Le client de la référence ${index + 1} est obligatoire`
      });
    }
    if (!safeStr(ref?.objet).trim()) {
      errors.push({
        field: `capacites_techniques.references.${index}.objet`,
        message: `L'objet de la référence ${index + 1} est obligatoire`
      });
    }
  });

  // Validation des certifications (si présentes)
  data.capacites_techniques?.certifications?.forEach((cert, index) => {
    if (!safeStr(cert?.nom).trim()) {
      errors.push({
        field: `capacites_techniques.certifications.${index}.nom`,
        message: `Le nom de la certification ${index + 1} est obligatoire`
      });
    }
  });

  return errors;
}
