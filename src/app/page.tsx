"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NizzaClass {
  classNumber: number;
  description: string;
}

interface DetailResult {
  aktenzeichen: string;
  anmeldetag: string;
  status: string;
  marke: string;
  markenform: string;
  markenkategorie: string;
  inhaber: string;
  inhaberAdresse: string;
  klassen: NizzaClass[];
  warenDienstleistungen: string;
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let className = "";

  if (lower.includes("eingetragen") || lower.includes("schutz")) {
    variant = "default";
    className = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  } else if (lower.includes("eingegangen") || lower.includes("anmeldung")) {
    variant = "secondary";
    className = "bg-amber-500/15 text-amber-400 border-amber-500/30";
  } else if (
    lower.includes("gelöscht") ||
    lower.includes("vernichtet") ||
    lower.includes("zurückgenommen")
  ) {
    variant = "destructive";
    className = "bg-red-500/15 text-red-400 border-red-500/30";
  }

  return (
    <Badge variant={variant} className={`${className} text-xs font-medium`}>
      {status}
    </Badge>
  );
}

function NizzaBadge({ cls }: { cls: NizzaClass }) {
  const colors = [
    "bg-blue-500/15 text-blue-400 border-blue-500/25",
    "bg-violet-500/15 text-violet-400 border-violet-500/25",
    "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    "bg-pink-500/15 text-pink-400 border-pink-500/25",
    "bg-orange-500/15 text-orange-400 border-orange-500/25",
    "bg-teal-500/15 text-teal-400 border-teal-500/25",
  ];
  const color = colors[cls.classNumber % colors.length];

  return (
    <div
      className={`inline-flex items-baseline gap-2 rounded-lg border px-3 py-1.5 text-sm ${color}`}
    >
      <span className="font-mono font-bold">{cls.classNumber}</span>
      <span className="opacity-75">{cls.description}</span>
    </div>
  );
}

function ResultCard({
  result,
  index,
}: {
  result: DetailResult;
  index: number;
}) {
  const [warenOpen, setWarenOpen] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {result.marke || result.aktenzeichen || "Unbekannt"}
            </h2>
            {result.aktenzeichen && (
              <p className="mt-1 font-mono text-sm text-white/40">
                {result.aktenzeichen}
              </p>
            )}
          </div>
          {result.status && <StatusBadge status={result.status} />}
        </div>

        {/* Metadata Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.markenform && (
            <MetaField label="Markenform" value={result.markenform} />
          )}
          {result.anmeldetag && (
            <MetaField label="Anmeldetag" value={result.anmeldetag} />
          )}
          {result.markenkategorie && (
            <MetaField label="Kategorie" value={result.markenkategorie} />
          )}
          {(result.inhaber || result.inhaberAdresse) && (
            <MetaField
              label="Inhaber / Anmelder"
              value={
                result.inhaberAdresse
                  ? `${result.inhaber}, ${result.inhaberAdresse}`
                  : result.inhaber
              }
              wide
            />
          )}
        </div>

        {/* Nizza Classes */}
        {result.klassen.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/30">
              Nizza-Klassen
            </p>
            <div className="flex flex-wrap gap-2">
              {result.klassen.map((cls) => (
                <NizzaBadge key={cls.classNumber} cls={cls} />
              ))}
            </div>
          </div>
        )}

        {/* Waren/Dienstleistungen */}
        {result.warenDienstleistungen && (
          <Collapsible open={warenOpen} onOpenChange={setWarenOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-white/[0.06] px-4 py-2.5 text-left text-sm text-white/50 transition-colors hover:border-white/[0.12] hover:text-white/70">
              <svg
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${warenOpen ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span>Waren & Dienstleistungen</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                  {result.warenDienstleistungen}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

function MetaField({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : ""}>
      <p className="mb-0.5 text-xs text-white/30">{label}</p>
      <p className="text-sm text-white/80">{value}</p>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-20">
      {/* Animated spinner */}
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white/40" />
      </div>
      <p className="max-w-sm text-center text-sm text-white/50">{message}</p>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DetailResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!query.trim() || loading) return;

      // Abort previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setResults([]);
      setError("");
      setStatusMsg("Starte Suche...");
      setSearched(true);

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim() }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ") && eventType) {
              try {
                const data = JSON.parse(line.slice(6));
                if (eventType === "status") {
                  setStatusMsg(data.message);
                } else if (eventType === "result") {
                  setResults((prev) => [...prev, data]);
                } else if (eventType === "done") {
                  setResults(data.results);
                } else if (eventType === "error") {
                  setError(data.message);
                }
              } catch {
                // skip malformed
              }
              eventType = "";
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
        setStatusMsg("");
      }
    },
    [query, loading]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-[40%] left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/[0.07] to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] rounded-full bg-gradient-to-t from-blue-600/[0.05] to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-white/40">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            DPMA Register
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Marken
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              suche
            </span>
          </h1>
          <p className="text-sm text-white/40 sm:text-base">
            Deutsches Patent- und Markenamt — Registerrecherche
          </p>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-violet-500/20 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-100" />
            <div className="group relative flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 backdrop-blur-xl transition-colors focus-within:border-white/[0.15]">
              <svg
                className="ml-3 h-5 w-5 shrink-0 text-white/25"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <Input
                type="text"
                placeholder="Markenname eingeben..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-base text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-lg bg-white px-6 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-30"
              >
                {loading ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  "Suchen"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading && <LoadingState message={statusMsg} />}

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-sm font-medium text-white/50">
                {results.length} Treffer
              </h2>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="flex flex-col gap-4">
              {results.map((r, i) => (
                <ResultCard
                  key={r.aktenzeichen || i}
                  result={r}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && results.length === 0 && !error && (
          <div className="py-20 text-center">
            <p className="text-sm text-white/30">
              Keine Treffer für diese Suche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
