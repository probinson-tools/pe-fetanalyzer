"use client";

import { useState } from "react";
import type { AnalysisState, SelectorResult, SelectorGroup } from "@/lib/types";

const SPECIFICITY_COLORS: Record<string, string> = {
  "ID-based": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Attribute-based": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Class combination": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Structural: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function specificityClass(specificity: string): string {
  for (const [key, cls] of Object.entries(SPECIFICITY_COLORS)) {
    if (specificity.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return "text-slate-400 bg-slate-400/10 border-slate-400/20";
}

const TIER_CONFIG = {
  good:   { label: "Good",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  better: { label: "Better", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  best:   { label: "Best",   color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
} as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      title="Copy"
      className="shrink-0 rounded px-2 py-0.5 text-xs border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function TierRow({ tier, result }: { tier: keyof typeof TIER_CONFIG; result: SelectorResult }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <div className="px-4 py-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={["text-xs font-semibold px-2 py-0.5 rounded border tracking-wide", cfg.color].join(" ")}>
          {cfg.label}
        </span>
        <CopyButton text={result.selector} />
      </div>
      <code className="font-code text-blue-300 text-sm break-all">{result.selector}</code>
      <div className="flex items-center gap-2">
        <span className={["text-xs px-1.5 py-0.5 rounded border", specificityClass(result.specificity)].join(" ")}>
          {result.specificity}
        </span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
    </div>
  );
}

function SelectorGroupCard({ group }: { group: SelectorGroup }) {
  return (
    <div className="rounded-lg border border-white/8 bg-[#1A1D2E] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 bg-[#21253a]">
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Target</p>
        <p className="text-sm text-slate-200 font-medium mt-0.5">{group.targetText}</p>
      </div>
      <div className="flex flex-col divide-y divide-white/6">
        {(["good", "better", "best"] as const).map((tier) => (
          <TierRow key={tier} tier={tier} result={group[tier]} />
        ))}
      </div>
    </div>
  );
}

function ReconstructedHtmlSection({ html }: { html: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/8 bg-[#1A1D2E] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/4 transition-colors"
      >
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Reconstructed HTML Source
        </span>
        <svg
          className={["w-4 h-4 text-slate-500 transition-transform", open ? "rotate-180" : ""].join(" ")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-white/8 p-4">
          <div className="flex justify-end mb-2">
            <CopyButton text={html} />
          </div>
          <pre className="font-code text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
            {html}
          </pre>
        </div>
      )}
    </div>
  );
}

interface ResultsPanelProps {
  state: AnalysisState;
}

export default function ResultsPanel({ state }: ResultsPanelProps) {
  if (state.status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <div className="w-12 h-12 rounded-full bg-[#21253a] border border-white/8 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </div>
        <p className="text-sm text-slate-400">
          Paste your element snapshot JSON and click <span className="text-slate-200 font-medium">Generate Selectors</span>.
        </p>
        <p className="text-xs text-slate-600">
          Results are grouped by target text with Good / Better / Best selector tiers.
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <svg className="animate-spin h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm text-slate-400">Analyzing element snapshot…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
        <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <span className="font-semibold">Error: </span>
          {state.message}
        </div>
      </div>
    );
  }

  const { groups, summary, reconstructedHtml } = state.data;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Summary */}
      <div className="rounded-lg border border-white/8 bg-[#1A1D2E] px-4 py-3">
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">Summary</p>
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
          {groups.length} group{groups.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grouped selector cards */}
      <div className="flex flex-col gap-4">
        {groups.map((group, i) => (
          <SelectorGroupCard key={i} group={group} />
        ))}
      </div>

      {/* Reconstructed HTML */}
      {reconstructedHtml && <ReconstructedHtmlSection html={reconstructedHtml} />}
    </div>
  );
}
