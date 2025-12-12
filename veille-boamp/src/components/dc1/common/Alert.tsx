import type { ReactNode, CSSProperties } from 'react';

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  children: ReactNode;
  style?: CSSProperties;
}

export function Alert({ type, children, style }: AlertProps) {
  return <div className={`alert alert-${type}`} style={style}>{children}</div>;
}
