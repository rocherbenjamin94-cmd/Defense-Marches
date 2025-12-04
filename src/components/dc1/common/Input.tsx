import React from 'react';
import { Tooltip } from './Tooltip';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  badge?: 'api' | 'manual';
  helpText?: string;
}

export function Input({ label, error, badge, helpText, className = '', ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && (
        <label className="label-with-help">
          {label}
          {helpText && <Tooltip content={helpText} />}
          {badge && <span className={`badge badge-${badge}`} style={{ marginLeft: 8 }}>{badge === 'api' ? 'API' : 'Manuel'}</span>}
        </label>
      )}
      <input className={className} {...props} />
      {error && <span style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{error}</span>}
    </div>
  );
}
