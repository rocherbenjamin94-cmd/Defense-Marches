interface AnalysisProgressProps {
  filename?: string;
}

export function AnalysisProgress({ filename }: AnalysisProgressProps) {
  return (
    <div
      style={{
        padding: 'var(--space-xl)',
        textAlign: 'center',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-muted)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          margin: '0 auto var(--space-md)',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {filename && (
        <p
          style={{
            fontWeight: 500,
            marginBottom: 'var(--space-sm)',
            wordBreak: 'break-all',
          }}
        >
          {filename}
        </p>
      )}

      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
        Analyse du document en cours...
      </p>

      <p style={{ color: 'var(--text-light)', fontSize: 12 }}>
        Extraction du texte et analyse avec l'IA
      </p>
    </div>
  );
}
