"use client";

import { useEffect, useMemo, useState } from "react";
import ResultCard from "@/components/ResultCard";
import TextInput from "@/components/TextInput";

type Result = {
  id: string;
  title: string;
  immediate: string;
  one_month: string;
  one_year: string;
  regret_score: number;
  advice: string;
  category: "money" | "relationships" | "school" | "health" | "other";
  note?: string;
  createdAt?: string;
};

const CATEGORY_LABELS: Record<Result["category"] | "all", string> = {
  all: "All",
  money: "Money",
  relationships: "Relationships",
  school: "School",
  health: "Health",
  other: "Other",
};

const EXAMPLES = [
  "Should I accept a lower-paying job with better work-life balance?",
  "Is it smarter to invest my savings instead of buying a new car?",
  "Should I tell my friend how I really feel about our relationship?",
];

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Result["category"]>("all");
  const [historySearch, setHistorySearch] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const savedHistory = localStorage.getItem("regret-history");
    const savedTheme = localStorage.getItem("theme");

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => console.warn("Service worker registration failed:", error));
    } else {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }

    window.requestAnimationFrame(() => {
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        } catch {
          localStorage.removeItem("regret-history");
        }
      }

      setDark(savedTheme === "dark");
      setHydrated(true);
    });
  }, []);

  function saveHistory(item: Result) {
    const entry = {
      ...item,
      createdAt: item.createdAt ?? new Date().toISOString(),
    };

    setHistory((current) => {
      const next = [entry, ...current.filter((historyItem) => historyItem.id !== entry.id)].slice(0, 10);
      if (typeof window !== "undefined") {
        localStorage.setItem("regret-history", JSON.stringify(next));
      }
      return next;
    });
  }

  async function analyze(input?: string) {
    const value = input ?? text;
    if (!value.trim()) {
      setError("Please describe a decision before analyzing.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    setNote("");
    setNoteStatus("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });

      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error ?? "Unable to analyze your decision.");
      }

      const withId: Result = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      setResult(withId);
      saveHistory(withId);
      setText(value);
      setCopyStatus("");
      setNote("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected analysis error.";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function deleteItem(id: string) {
    setHistory((current) => {
      const next = current.filter((item) => item.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("regret-history", JSON.stringify(next));
      }
      return next;
    });
    if (result?.id === id) {
      setResult(null);
      setNote("");
      setNoteStatus("");
    }
  }

  function clearHistory() {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("regret-history");
    }
  }

  function handleHistorySelect(item: Result) {
    setResult(item);
    setText(item.title);
    setNote(item.note ?? "");
    setCopyStatus("");
    setNoteStatus("");
  }

  function saveNote() {
    if (!result) return;

    const updated = {
      ...result,
      note: note.trim(),
    };

    setResult(updated);
    saveHistory(updated);
    setNoteStatus("Note saved to history.");
  }

  function downloadAnalysis() {
    if (!result) return;

    const payload = `RegretGPT Decision Report\n\nTitle: ${result.title}\nCategory: ${CATEGORY_LABELS[result.category]}\nRegret: ${result.regret_score}%\n\nNow:\n${result.immediate}\n\n1 Month:\n${result.one_month}\n\n1 Year:\n${result.one_year}\n\nAdvice:\n${result.advice}\n\nNote:\n${result.note ?? "(none)"}\n`;
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `regret-report-${result.id}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(href);
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next ? "dark" : "light");
    }
  }

  function clearInput() {
    setText("");
    setError("");
  }

  function formatDate(value?: string) {
    if (!value) return "";
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchSearch = historySearch.trim().length === 0 || item.title.toLowerCase().includes(historySearch.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [categoryFilter, history, historySearch]);

  const stats = useMemo(() => {
    const total = history.length;
    const average = total ? Math.round(history.reduce((sum, item) => sum + item.regret_score, 0) / total) : 0;
    const latest = history[0]?.createdAt;
    return { total, average, latest };
  }, [history]);

  async function copyAnalysis() {
    if (!result) return;
    const summary = `RegretGPT analysis for: ${result.title}\nNow: ${result.immediate}\n1 Month: ${result.one_month}\n1 Year: ${result.one_year}\nAdvice: ${result.advice}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Copied to clipboard!");
    } catch {
      setCopyStatus("Unable to copy on this browser.");
    }
  }

  function shareAnalysis() {
    if (!result || typeof navigator === "undefined") return;
    const summary = `RegretGPT analysis for: ${result.title}\nNow: ${result.immediate}\n1 Month: ${result.one_month}\n1 Year: ${result.one_year}\nAdvice: ${result.advice}`;
    if (navigator.share) {
      navigator.share({
        title: `RegretGPT analysis: ${result.title}`,
        text: summary,
      });
    } else {
      setCopyStatus("Share is not supported in this browser.");
    }
  }

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <div className="center">
        <header className="topbar">
          <div>
            <h1 className="title">💀 RegretGPT</h1>
            <p className="subtitle">
              Simulate how a decision feels today, in one month, and in one year.
            </p>
          </div>

          <button className="settingsBtn" onClick={toggleTheme}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        <section className="inputCard">
          <div className="inputHeader">
            <div>
              <h2 className="sectionTitle">Describe your decision</h2>
              <p className="sectionDescription">
                Write your choice clearly and get a fast regret forecast plus actionable advice.
              </p>
            </div>
            <span className="counter">{text.length}/300</span>
          </div>

          <TextInput
            placeholder="Example: Should I quit my job and try freelancing?"
            value={text}
            setValue={setText}
            maxLength={300}
            rows={6}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                analyze();
              }
            }}
          />

          <div className="row actionRow">
            <button className="primaryBtn" disabled={!text.trim() || loading} onClick={() => analyze()}>
              {loading ? "Analyzing..." : "Analyze decision"}
            </button>
            <button className="secondaryBtn" type="button" onClick={clearInput}>
              Clear input
            </button>
          </div>

          <div className="buttonGroup">
            {EXAMPLES.map((example) => (
              <button key={example} type="button" className="chip" onClick={() => analyze(example)}>
                {example}
              </button>
            ))}
          </div>

          {error && <div className="status error">{error}</div>}
        </section>

        <section className="infoCard">
          <h3>How this app works</h3>
          <p>
            RegretGPT uses AI to help you think through outcomes and see what your decision may feel like over time. Use the history tools to compare past ideas and improve your decision process.
          </p>
        </section>

        {result && (
          <section className="resultSection">
            <div className="resultActions">
              <button className="primaryBtn" onClick={copyAnalysis}>Copy result</button>
              <button className="secondaryBtn" type="button" onClick={downloadAnalysis}>Download report</button>
              <button className="secondaryBtn" type="button" onClick={shareAnalysis}>Share</button>
              <button className="secondaryBtn" type="button" onClick={() => analyze(result.title)}>
                Re-run
              </button>
            </div>
            {copyStatus && <div className="status success">{copyStatus}</div>}
            <div className="noteSection">
              <h3 className="sectionTitle">Personal note</h3>
              <TextInput
                className="noteTextarea"
                placeholder="Write a follow-up thought, reminder, or why this decision matters to you."
                value={note}
                setValue={setNote}
                rows={4}
              />
              <div className="row actionRow">
                <button className="primaryBtn" disabled={!result} onClick={saveNote}>
                  Save note
                </button>
                {noteStatus && <span className="status success">{noteStatus}</span>}
              </div>
            </div>
            <ResultCard data={result} />
          </section>
        )}

        <section className="statsGrid">
          <article className="statCard">
            <span className="statLabel">Decisions tracked</span>
            <strong>{hydrated ? stats.total : 0}</strong>
          </article>
          <article className="statCard">
            <span className="statLabel">Average regret</span>
            <strong>{hydrated ? `${stats.average}%` : "0%"}</strong>
          </article>
          <article className="statCard">
            <span className="statLabel">Most recent</span>
            <strong>{hydrated ? (stats.latest ? formatDate(stats.latest) : "None yet") : "Loading…"}</strong>
          </article>
        </section>

        <section className="historyPanel">
          <div className="historyHeader">
            <div>
              <h3>Recent decisions</h3>
              <p className="historyMeta">Filter, search, and reopen any saved analysis.</p>
            </div>
            <button className="secondaryBtn" type="button" onClick={clearHistory}>
              🗑️ Clear history
            </button>
          </div>

          <div className="filterRow">
            <div className="buttonGroup">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`pill ${categoryFilter === key ? "active" : ""}`}
                  onClick={() => setCategoryFilter(key as typeof categoryFilter)}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="search"
              className="searchInput"
              placeholder="Search history..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>

          <div className="historyList">
            {filteredHistory.length === 0 ? (
              <div className="emptyState">No saved decisions match your filters.</div>
            ) : (
              filteredHistory.map((item) => (
                <div key={item.id} className="historyItem">
                  <button
                    type="button"
                    className="historyLink"
                    onClick={() => handleHistorySelect(item)}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <div className="historyMeta">{CATEGORY_LABELS[item.category]} · {formatDate(item.createdAt)}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="deleteBtn"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => deleteItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
