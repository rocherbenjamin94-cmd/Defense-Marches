import type { ReactNode } from 'react';

interface MainContainerProps {
  children: ReactNode;
}

export function MainContainer({ children }: MainContainerProps) {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 var(--space-md) var(--space-xl)' }}>
      {children}
    </main>
  );
}
