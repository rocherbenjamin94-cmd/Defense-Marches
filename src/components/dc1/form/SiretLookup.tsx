import { useState } from 'react';
import { Button, Alert } from '@/components/dc1/common';
import { usePappersLookup, useSiretValidation } from '@/hooks/dc1';
import { formatSiret } from '@/lib/dc1/utils/validation';
import type { EntrepriseData } from '@/lib/dc1/types';

interface SiretLookupProps {
  onSelect: (data: EntrepriseData) => void;
  currentSiret?: string;
}

export function SiretLookup({ onSelect, currentSiret }: SiretLookupProps) {
  const { value, setValue, validation, queryType, isSearchable } = useSiretValidation(currentSiret || '');
  const { lookup, data, isLoading, error, reset } = usePappersLookup();
  const [lastSource, setLastSource] = useState<'cache' | 'pappers' | null>(null);

  const handleSearch = async () => {
    if (!isSearchable) return;
    setLastSource(null);
    await lookup(value);
  };

  const handleSelect = (entreprise: EntrepriseData) => {
    onSelect(entreprise);
    reset();
    setValue(entreprise.siret || '');
    setLastSource('pappers');
  };

  const results = Array.isArray(data) ? data : data ? [data] : [];

  // Icône de statut de validation
  const getValidationIcon = () => {
    switch (validation.status) {
      case 'empty':
        return null;
      case 'incomplete':
        return <span style={{ color: 'var(--color-warning)' }}>⚠️</span>;
      case 'invalid_chars':
      case 'invalid_luhn':
        return <span style={{ color: 'var(--color-error)' }}>❌</span>;
      case 'valid':
        return <span style={{ color: 'var(--color-success)' }}>✅</span>;
      default:
        return null;
    }
  };

  // Message de validation
  const getValidationMessage = () => {
    if (validation.status === 'empty') return null;

    if (validation.status === 'valid') {
      return { text: queryType === 'siret' ? 'Format SIRET valide' : 'Format SIREN valide', type: 'success' as const };
    }

    return {
      text: validation.error || '',
      type: validation.status === 'incomplete' ? 'warning' as const : 'error' as const
    };
  };

  const validationMsg = getValidationMessage();

  return (
    <div style={{ marginBottom: 'var(--space-md)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>
            Rechercher par SIRET ou SIREN
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez un SIRET (14 chiffres) ou SIREN (9 chiffres)"
              onKeyDown={(e) => e.key === 'Enter' && isSearchable && handleSearch()}
              style={{
                width: '100%',
                padding: 'var(--space-sm) var(--space-md)',
                paddingRight: '40px',
                border: `1px solid ${validation.status === 'invalid_luhn' || validation.status === 'invalid_chars'
                    ? 'var(--color-error)'
                    : validation.status === 'valid'
                      ? 'var(--color-success)'
                      : 'var(--border)'
                  }`,
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
            />
            {getValidationIcon() && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
              }}>
                {getValidationIcon()}
              </span>
            )}
          </div>

          {/* Message de validation */}
          {validationMsg && (
            <div style={{
              marginTop: 'var(--space-xs)',
              fontSize: 12,
              color: validationMsg.type === 'error'
                ? 'var(--color-error)'
                : validationMsg.type === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)',
            }}>
              {validationMsg.text}
            </div>
          )}

          {/* Indicateur de type de recherche */}
          {value.length > 0 && (
            <div style={{
              marginTop: 'var(--space-xs)',
              fontSize: 11,
              color: 'var(--text-light)',
            }}>
              {queryType === 'siret' && `Mode SIRET (${validation.digitCount}/14 chiffres)`}
              {queryType === 'siren' && `Mode SIREN (${validation.digitCount}/9 chiffres)`}
            </div>
          )}
        </div>

        <Button
          onClick={handleSearch}
          loading={isLoading}
          disabled={!isSearchable}
          style={{ marginTop: '24px' }}
        >
          Rechercher
        </Button>
      </div>

      {error && <Alert type="error" style={{ marginTop: 'var(--space-sm)' }}>{error}</Alert>}

      {lastSource && (
        <div style={{
          marginTop: 'var(--space-xs)',
          fontSize: 11,
          color: lastSource === 'cache' ? 'var(--color-success)' : 'var(--color-primary)',
        }}>
          {lastSource === 'cache'
            ? '✅ Données chargées depuis le cache (0 crédit)'
            : '📡 Données récupérées depuis Pappers'
          }
        </div>
      )}

      {/* Résultats de recherche */}
      {results.length > 0 && (
        <div style={{
          marginTop: 'var(--space-sm)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          maxHeight: 300,
          overflowY: 'auto',
        }}>
          {results.map((entreprise, index) => (
            <div
              key={entreprise.siret || index}
              onClick={() => handleSelect(entreprise)}
              style={{
                padding: 'var(--space-md)',
                borderBottom: index < results.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 500 }}>{entreprise.nom_commercial || entreprise.denomination_sociale || 'N/A'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                SIRET: {formatSiret(entreprise.siret) || 'N/A'} | {entreprise.forme_juridique || 'N/A'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                {entreprise.adresse_etablissement || 'Adresse non disponible'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
