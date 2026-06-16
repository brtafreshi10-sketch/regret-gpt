export default function RegretMeter({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>Regret Level</span>
        <span>{score}%</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
