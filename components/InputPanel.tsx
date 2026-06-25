"use client";

import { useState } from "react";
import type { AnalysisState } from "@/lib/types";

interface InputPanelProps {
  onResult: (state: AnalysisState) => void;
}

export default function InputPanel({ onResult }: InputPanelProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [targetText, setTargetText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateJson(value: string): boolean {
    if (!value.trim()) {
      setJsonError(null);
      return false;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (e: unknown) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
      return false;
    }
  }

  function handleJsonChange(value: string) {
    setJsonInput(value);
    validateJson(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateJson(jsonInput) || !jsonInput.trim()) return;

    setLoading(true);
    onResult({ status: "loading" });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonInput, targetText: targetText || undefined }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        onResult({ status: "error", message: data.error ?? "Request failed" });
      } else {
        onResult({ status: "done", data });
      }
    } catch (err: unknown) {
      onResult({
        status: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = jsonInput.trim() && !jsonError && !loading;

  return (
    <div className="flex flex-col gap-4 h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {/* JSON Input */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Element Snapshot JSON
              <span className="ml-1 text-red-400">*</span>
            </label>
            {jsonError && (
              <span className="text-xs text-red-400 font-code truncate max-w-[200px]" title={jsonError}>
                Parse error
              </span>
            )}
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={`[\n  {\n    "cssSelector": "#main .hero-title",\n    "cssPath": "body > main > section > h1",\n    "element": "<h1 class=\\"hero-title\\">Welcome</h1>"\n  }\n]`}
            spellCheck={false}
            className={[
              "flex-1 min-h-[280px] w-full resize-none rounded-lg p-3 font-code text-slate-200",
              "bg-[#21253a] border focus:outline-none",
              jsonError
                ? "border-red-500/60 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.35)]"
                : "border-white/10 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.35)]",
            ].join(" ")}
          />
          {jsonError && (
            <p className="text-xs text-red-400 font-code">{jsonError}</p>
          )}
        </div>

        {/* Target Text */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Target Text
            <span className="ml-2 text-slate-600 normal-case tracking-normal font-normal">optional</span>
          </label>
          <input
            type="text"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            placeholder="e.g. Get Started, Sign Up, Learn More…"
            className="w-full rounded-lg px-3 py-2.5 text-sm text-slate-200 bg-[#21253a] border border-white/10 focus:outline-none focus:shadow-[0_0_0_2px_rgba(59,130,246,0.35)] placeholder:text-slate-600"
          />
          <p className="text-xs text-slate-500">
            Providing a target text narrows the selectors to elements containing that content.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg py-2.5 px-4 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyzing…
            </>
          ) : (
            "Generate Selectors"
          )}
        </button>
      </form>
    </div>
  );
}
