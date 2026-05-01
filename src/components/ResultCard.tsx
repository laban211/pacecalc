interface ResultCardProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  onTap?: () => void;
  tapHint?: string;
}

export function ResultCard({
  label,
  value,
  subValue,
  highlight = false,
  onTap,
  tapHint,
}: ResultCardProps): React.JSX.Element {
  const classes = `rounded-2xl p-4 w-full text-left ${
    highlight
      ? "bg-accent/10 border border-accent/30"
      : "bg-surface border border-border"
  } ${onTap ? "active:brightness-110 transition-all" : ""}`;

  const content = (
    <>
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
      {tapHint && (
        <p className="text-xs text-text-secondary/60 mt-1.5">{tapHint}</p>
      )}
    </>
  );

  if (onTap) {
    return <button type="button" onClick={onTap} className={classes}>{content}</button>;
  }
  return <div className={classes}>{content}</div>;
}
