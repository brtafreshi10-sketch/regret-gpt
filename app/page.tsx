"use client";

import { useState } from "react";
import TextInput from "@/components/TextInput";
import ResultCard from "@/components/ResultCard";

type RegretResult = {
  immediate: string;
  one_month: string;
  one_year: string;
  regret_score: number;
  advice: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<RegretResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            RegretGPT
          </h1>
          <p className="text-gray-400">
            Predict how much you’ll regret your decisions before you make them
          </p>
        </div>

        {/* INPUT */}
        <TextInput value={text} setValue={setText} />

        {/* BUTTON */}
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Decision"}
        </button>

        {/* ERROR */}
        {error && (
          <div className="p-4 rounded-xl bg-red-900/40 border border-red-500 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* RESULT */}
        {result && !error && (
          <ResultCard result={result} />
        )}

      </div>
    </main>
  );
}