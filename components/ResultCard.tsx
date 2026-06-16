import RegretMeter from "@/components/RegretMeter";

type RegretResult = {
  immediate: string;
  one_month: string;
  one_year: string;
  regret_score: number;
  advice: string;
};

export default function ResultCard({ result }: { result: RegretResult }) {
  return (
    <div className="mt-6 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
      <RegretMeter score={result.regret_score} />

      <div className="space-y-2 text-sm text-gray-200">
        <p>🟢 Immediate: {result.immediate}</p>
        <p>🟡 1 Month: {result.one_month}</p>
        <p>🔴 1 Year: {result.one_year}</p>
      </div>

      <div className="p-3 bg-zinc-800 rounded-xl text-sm text-blue-200">
        💡 {result.advice}
      </div>
    </div>
  );
}
