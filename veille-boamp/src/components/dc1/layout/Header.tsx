export function Header() {
  return (
    <header style={{
      background: 'var(--bg)',
      padding: 'var(--space-md) var(--space-lg)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 'var(--space-lg)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
            DC1 Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>
            Lettre de candidature aux marchés publics
          </p>
        </div>
        <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', fontSize: 12 }}>
          v2019
        </span>
      </div>
    </header>
  );
}
