interface ResultCardProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}

export function ResultCard({
  label,
  value,
  subValue,
  highlight = false,
}: ResultCardProps): React.JSX.Element {
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight
          ? "bg-accent/10 border border-accent/30"
          : "bg-surface border border-border"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold font-mono tracking-wide ${
          highlight ? "text-accent" : "text-text"
        }`}
      >
        {value}
      </p>
      {subValue && (
        <p className="text-sm text-text-secondary mt-0.5">{subValue}</p>
      )}
    </div>
  );
}
