interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
}

export function RadioCard({ name, value, checked, onChange, title, description }: RadioCardProps) {
  return (
    <label className={`radio-card ${checked ? 'selected' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <div className="radio-card-content">
        <div className="radio-card-title">{title}</div>
        {description && <div className="radio-card-description">{description}</div>}
      </div>
    </label>
  );
}
