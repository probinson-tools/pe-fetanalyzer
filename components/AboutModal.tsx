"use client";

import { useEffect } from "react";

export default function AboutModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-w-2xl w-full bg-[#1A1D2E] rounded-xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-slate-100">FET Analyzer</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 tracking-wide uppercase">
                CSS Selector
              </span>
            </div>
            <p className="text-sm text-slate-400">Identify and target untranslatable content in Front-End Translation snapshots.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors text-xl leading-none mt-0.5 shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-6 text-sm text-slate-400 leading-relaxed">

          {/* What is it */}
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">What is FET Analyzer?</h2>
            <p>
              FET Analyzer is an internal engineering tool for working with{" "}
              <span className="text-slate-200 font-medium">Front-End Translation (FET)</span> — a proxy-based
              translation approach that intercepts and replaces text content on a page at runtime. During FET, a JSON
              snapshot of the page&apos;s DOM elements is generated, containing each element&apos;s text content, CSS
              selector, and full CSS path.
            </p>
            <p className="mt-2">
              FET Analyzer takes that snapshot and uses AI to quickly locate and target content that{" "}
              <span className="text-slate-200 font-medium">should not be translated</span> — such as proper names,
              brand identifiers, user-generated content, and dynamic values — then generates ready-to-use CSS selectors
              for each.
            </p>
          </section>

          {/* Who is it for */}
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Who is it for?</h2>
            <ul className="flex flex-col gap-1 list-disc list-inside marker:text-slate-600">
              <li>Front-end and QA engineers working on FET-enabled sites</li>
              <li>Engineers who need to identify untranslatable strings in a translated page&apos;s element snapshot</li>
              <li>Anyone who needs stable CSS selectors for targeting specific DOM elements</li>
              <li>Engineers inspecting reconstructed HTML source of a translated page</li>
            </ul>
          </section>

          {/* How to use */}
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-3">How to use it</h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  step: "1",
                  title: "Paste your JSON snapshot",
                  body: <>Copy the FET-generated JSON object into the <span className="text-slate-300">Element Snapshot JSON</span> field. Each key is a segment identifier; each value contains <code className="font-code text-blue-300 bg-[#21253a] px-1 rounded">element</code>, <code className="font-code text-blue-300 bg-[#21253a] px-1 rounded">cssSelector</code>, and <code className="font-code text-blue-300 bg-[#21253a] px-1 rounded">cssPath</code> fields.</>,
                },
                {
                  step: "2",
                  title: "Optionally specify target text",
                  body: "Enter one or more strings to locate (e.g. a display name, brand name, or account label). Each string gets its own result group. Leave blank to let the AI auto-detect likely untranslatable content.",
                },
                {
                  step: "3",
                  title: "Optionally enable HTML reconstruction",
                  body: <>Check <span className="text-slate-300">Reconstruct HTML source</span> to have the AI rebuild a readable approximation of the original page HTML. Each result group&apos;s <span className="text-blue-400">View HTML</span> button opens the reconstruction and scrolls directly to that element.</>,
                },
                {
                  step: "4",
                  title: "Choose a model and generate",
                  body: <><span className="text-slate-300">Haiku</span> (default) is fast and cost-efficient — recommended for most snapshots. <span className="text-slate-300">Sonnet</span> offers higher accuracy for complex or deeply-nested DOMs. Click <span className="text-slate-300">Generate Selectors</span> to run the analysis.</>,
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {step}
                  </span>
                  <div>
                    <p className="text-slate-200 font-medium mb-0.5">{title}</p>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Understanding results */}
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Understanding the results</h2>
            <p className="mb-3">Each result group provides three CSS selector options ranked by stability:</p>
            <table className="w-full text-sm border border-white/8 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#21253a] text-left">
                  <th className="px-3 py-2 text-slate-400 font-semibold border-b border-white/8 w-24">Option</th>
                  <th className="px-3 py-2 text-slate-400 font-semibold border-b border-white/8">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { opt: "Option 1", color: "text-amber-400",   desc: "Structural / positional — works but may break on DOM changes" },
                  { opt: "Option 2", color: "text-emerald-400", desc: "Class-based or attribute-presence — more semantic and stable" },
                  { opt: "Option 3", color: "text-blue-400",    desc: "ID or unique data attribute — most resilient; preferred for production" },
                ].map(({ opt, color, desc }) => (
                  <tr key={opt} className="border-t border-white/6">
                    <td className={["px-3 py-2 font-medium", color].join(" ")}>{opt}</td>
                    <td className="px-3 py-2 text-slate-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Attribute format */}
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Attribute selector format</h2>
            <p className="mb-2">All generated selectors use <span className="text-slate-200 font-medium">unquoted attribute values</span> per the FET targeting convention:</p>
            <div className="bg-[#21253a] rounded-lg px-4 py-3 flex flex-col gap-1 font-code text-xs">
              <div><span className="text-emerald-400">✓</span> <span className="text-blue-300">p[data-testid=my-shortcuts-label]</span></div>
              <div><span className="text-red-400">✗</span> <span className="text-slate-500">p[data-testid=&quot;my-shortcuts-label&quot;]</span></div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
