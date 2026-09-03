"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with a real API call (e.g. Finnhub /search endpoint)
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    setResults([`Result for "${query}" #1`, `Result for "${query}" #2`]);
  };

  return (
    <div className="site-container py-10">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text)]">
        Search Stocks
      </h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ticker or company name..."
          className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-gray-500 focus:border-[rgba(232,186,64,0.4)] focus:shadow-[0_0_0_3px_rgba(232,186,64,0.08)]"
        />
        <button
          type="submit"
          className="rounded-[10px] bg-gradient-to-br from-[#e8ba40] to-[#d4a020] px-6 py-3 text-sm font-bold text-[#0a0a0a] transition-transform hover:-translate-y-[1px] hover:shadow-[0_6px_20px_-4px_rgba(232,186,64,0.35)]"
        >
          Search
        </button>
      </form>

      <div className="space-y-2">
        {results.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No results yet. Try searching above.
          </p>
        ) : (
          results.map((result, i) => (
            <div
              key={i}
              className="rounded-[10px] border border-white/5 bg-[var(--panel)] p-4 text-sm text-[var(--text)]"
            >
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
}