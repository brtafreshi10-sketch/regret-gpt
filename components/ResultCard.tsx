import RegretMeter from "./RegretMeter";

type Result = {
  title: string;
  immediate: string;
  one_month: string;
  one_year: string;
  regret_score: number;
  advice: string;
  category: "money" | "relationships" | "school" | "health" | "other";
};

const LABELS: Record<Result["category"], string> = {
  money: "Money",
  relationships: "Relationships",
  school: "School",
  health: "Health",
  other: "Other",
};

export default function ResultCard({ data }: { data: Result }) {
  return (
    <div className="card resultCard">
      <div className="resultHeader">
        <div>
          <h2>{data.title}</h2>
          <span className="badge">{LABELS[data.category]}</span>
        </div>
        <div className="resultScore">{data.regret_score}% regret</div>
      </div>

      <RegretMeter score={data.regret_score} />

      <div className="resultGrid">
        <div>
          <h4>Now</h4>
          <p>{data.immediate}</p>
        </div>
        <div>
          <h4>1 Month</h4>
          <p>{data.one_month}</p>
        </div>
        <div>
          <h4>1 Year</h4>
          <p>{data.one_year}</p>
        </div>
      </div>

      <div className="advice">💡 {data.advice}</div>
    </div>
  );
}
