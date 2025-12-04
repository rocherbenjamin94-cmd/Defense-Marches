import React from 'react';
import { Tooltip } from './Tooltip';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Textarea({ label, error, helpText, className = '', ...props }: TextareaProps) {
  return (
    <div className="form-group">
      {label && (
        <label className="label-with-help">
          {label}
          {helpText && <Tooltip content={helpText} />}
        </label>
      )}
      <textarea className={className} rows={4} {...props} />
      {error && <span style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{error}</span>}
    </div>
  );
}
