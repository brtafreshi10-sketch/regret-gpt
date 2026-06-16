import RegretMeter from "./RegretMeter";

export default function ResultCard({ data }: any) {
  return (
<div className="card space-y-4">
      <h2 className="text-xl font-bold">{data.title}</h2>

      <RegretMeter score={data.regret_score} />

      <div className="space-y-2 text-sm">
        <p><b>Immediately:</b> {data.immediate}</p>
        <p><b>1 Month:</b> {data.one_month}</p>
        <p><b>1 Year:</b> {data.one_year}</p>
      </div>

      <div className="bg-gray-100 p-3 rounded-lg text-sm">
        💡 {data.advice}
      </div>
    </div>
  );
}