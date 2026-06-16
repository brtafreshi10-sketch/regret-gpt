"use client";

import { useEffect, useState } from "react";

type Result = {
  id: string;
  title: string;
  immediate: string;
  one_month: string;
  one_year: string;
  regret_score: number;
  advice: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  // LOAD MEMORY + THEME
  useEffect(() => {
    const saved = localStorage.getItem("regret-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch {}
    }

    const theme = localStorage.getItem("theme");
    if (theme === "dark") setDark(true);
  }, []);

  // SAVE HISTORY
  function save(item: Result) {
    const updated = [item, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("regret-history", JSON.stringify(updated));
  }

  // ANALYZE
  async function analyze(input?: string) {
    const value = input ?? text;
    if (!value.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ text: value }),
      });

      const data = await res.json();

      const withId: Result = {
        ...data,
        id: crypto.randomUUID(),
      };

      setResult(withId);
      save(withId);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // DELETE ONE
  function deleteItem(id: string) {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("regret-history", JSON.stringify(updated));
  }

  // CLEAR ALL
  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("regret-history");
  }

  // THEME TOGGLE
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <div className="center">

        {/* HEADER */}
        <div className="topbar">
          <h1 className="title">💀 RegretGPT</h1>

          <button className="settingsBtn" onClick={toggleTheme}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        <p className="subtitle">
          AI-powered decision simulator
        </p>

        {/* INPUT */}
        <div className="inputCard">
          <textarea
            placeholder="Describe your decision..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
          />

          <div className="row">
            <span className="counter">{text.length}/300</span>

            <button onClick={() => analyze()}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="card">
            <h2>{result.title}</h2>

            <p><b>Now:</b> {result.immediate}</p>
            <p><b>1 Month:</b> {result.one_month}</p>
            <p><b>1 Year:</b> {result.one_year}</p>

            <div className="meter">
              <div
                className="fill"
                style={{ width: `${result.regret_score}%` }}
              />
            </div>

            <p className="advice">💡 {result.advice}</p>
          </div>
        )}

        {/* HISTORY */}
        {Array.isArray(history) && history.length > 0 && (
          <div className="history">

            <div className="row" style={{ marginBottom: 10 }}>
              <h3>Recent Decisions</h3>

              <button onClick={clearHistory}>
                🗑️ Clear All
              </button>
            </div>

            {history.map((item, i) => {
              if (!item) return null;

              return (
                <div key={item.id ?? i} className="historyItemWrapper">

                  <div
                    className="historyItem"
                    onClick={() => {
                      setResult(item);
                      setText(item.title);
                    }}
                  >
                    {item.title}
                  </div>

                  <button
                    className="deleteBtn"
                    onClick={() => deleteItem(item.id)}
                  >
                    ✕
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}