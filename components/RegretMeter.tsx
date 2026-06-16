"use client";

export default function RegretMeter({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>Regret Level</span>
        <span>{score}/100</span>
      </div>

      <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
