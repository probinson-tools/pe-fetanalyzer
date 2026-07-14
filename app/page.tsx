"use client";

import { useState } from "react";
import Image from "next/image";
import InputPanel from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";
import AboutModal from "@/components/AboutModal";
import type { AnalysisState } from "@/lib/types";

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({ status: "idle" });
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#0F1117]">
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-white/8 bg-[#0F1117]">
        <a
          href="https://pe-commandcenter.vercel.app"
          title="PE Command Center"
          className="hidden md:block absolute left-1/2 -translate-x-1/2"
        >
          <Image src="/logo-marketfully-dark.svg" alt="Marketfully" width={119} height={28} priority />
        </a>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-200 tracking-tight">pe-fetanalyzer</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 tracking-wide uppercase">
            CSS Selector
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500 hidden sm:block">
            Paste an element snapshot JSON → get optimal CSS selectors
          </p>
          <button
            type="button"
            onClick={() => setShowAbout(true)}
            className="text-xs text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 rounded px-2.5 py-1 transition-colors shrink-0"
          >
            About FET Analyzer
          </button>
        </div>
      </header>

      {/* Main Two-Panel Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Input Panel */}
        <aside className="w-[420px] shrink-0 border-r border-white/8 bg-[#1A1D2E] flex flex-col overflow-y-auto p-5">
          <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Input</h2>
          <InputPanel onResult={setAnalysisState} />
        </aside>

        {/* Right: Results Panel */}
        <section className="flex-1 overflow-y-auto p-5 bg-[#0F1117]">
          <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Results</h2>
          <ResultsPanel state={analysisState} />
        </section>
      </main>
    </div>
  );
}
