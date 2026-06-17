export default function RegretMeter({ score }: { score: number }) {
  const color = score <= 33 ? "#22c55e" : score <= 66 ? "#f59e0b" : "#ef4444";

  return (
    <div className="meterWrapper">
      <div className="meterLabel">
        <span>Regret level</span>
        <span>{score}%</span>
      </div>
      <div className="meter">
        <div
          className="fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
