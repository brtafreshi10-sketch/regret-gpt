export default function RegretMeter({ score }: { score: number }) {
  const normalized = Number.isFinite(score) ? Math.round(score) : 0;
  const clamped = Math.max(0, Math.min(100, normalized));
  const hue = Math.round(122 - clamped * 1.22);
  const color = `hsl(${hue}, 82%, 52%)`;
  const badgeBackground = `hsla(${hue}, 82%, 52%, 0.18)`;

  const label =
    clamped <= 10
      ? "No regret"
      : clamped <= 30
      ? "Minimal regret"
      : clamped <= 50
      ? "Mild regret"
      : clamped <= 70
      ? "Moderate regret"
      : clamped <= 90
      ? "High regret"
      : "Severe regret";

  return (
    <div className="meterWrapper">
      <div className="meterLabel">
        <span>Regret level</span>
        <span>{clamped}%</span>
      </div>
      <div className="meter">
        <div
          className="fill"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <div className="meterBadge" style={{ backgroundColor: badgeBackground, color }}>
        {label}
      </div>
    </div>
  );
}
