"use client";

import { useState } from "react";
import type { AnalysisState } from "@/lib/types";

interface InputPanelProps {
  onResult: (state: AnalysisState) => void;
}

export default function InputPanel({ onResult }: InputPanelProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [targetTexts, setTargetTexts] = useState<string[]>([""]);
  const [reconstructHtml, setReconstructHtml] = useState(false);
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

  function addTarget() {
    setTargetTexts((p) => [...p, ""]);
  }

  function removeTarget(i: number) {
    setTargetTexts((p) => p.filter((_, idx) => idx !== i));
  }

  function updateTarget(i: number, v: string) {
    setTargetTexts((p) => p.map((t, idx) => (idx === i ? v : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateJson(jsonInput) || !jsonInput.trim()) return;

    setLoading(true);
    onResult({ status: "loading" });

    const cleanedTargets = targetTexts.map((t) => t.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonInput,
          targetTexts: cleanedTargets.length > 0 ? cleanedTargets : undefined,
          reconstructHtml: reconstructHtml || undefined,
        }),
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
            placeholder={`{\n  "segment_key": {\n    "cssSelector": "#main .hero-title",\n    "cssPath": "body > main > section > h1",\n    "element": "<h1 class=\\"hero-title\\">Welcome</h1>"\n  }\n}`}
            spellCheck={false}
            className={[
              "flex-1 min-h-[240px] w-full resize-none rounded-lg p-3 font-code text-slate-200",
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

        {/* Target Texts */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Target Text
            <span className="ml-2 text-slate-600 normal-case tracking-normal font-normal">optional</span>
          </label>
          <div className="flex flex-col gap-2">
            {targetTexts.map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => updateTarget(i, e.target.value)}
                  placeholder="e.g. Sign Out, Owner's Manual…"
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-slate-200 bg-[#21253a] border border-white/10 focus:outline-none focus:shadow-[0_0_0_2px_rgba(59,130,246,0.35)] placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => removeTarget(i)}
                  disabled={targetTexts.length === 1}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-red-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-lg leading-none"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTarget}
            className="self-start text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            + Add target text
          </button>
          <p className="text-xs text-slate-500">
            Each string gets its own group of Good / Better / Best selectors. Leave blank to auto-detect non-translatable text.
          </p>
        </div>

        {/* Reconstruct HTML toggle */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reconstructHtml}
              onChange={(e) => setReconstructHtml(e.target.checked)}
              className="rounded border-white/20 bg-[#21253a] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-300">Reconstruct HTML source</span>
          </label>
          <p className="text-xs text-slate-500 ml-7">
            Claude reconstructs the original pre-translation HTML from the snapshot.
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
