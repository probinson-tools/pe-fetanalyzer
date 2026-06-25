import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { GenerateResponse } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert at analyzing DOM element snapshots and generating optimal CSS selectors for proxy-translated site testing.

Given a JSON snapshot (an object whose keys are segment names; each value has cssSelector, cssPath, and element HTML fields), generate grouped CSS selectors.

## Selector quality tiers
For each target, produce exactly three selectors ranked by quality:

- good: A structural or positional selector (e.g. nth-child, descendant by tag). Works but fragile to DOM changes.
- better: A class combination or attribute-presence selector. More semantic and stable than positional.
- best: An ID-based or uniquely-identifying data attribute selector ([data-testid="..."], [aria-label="..."], #id). Most resilient to DOM churn. If no ID or unique attribute exists, use the most distinctive combination of classes and attributes available.

For each SelectorResult provide:
- selector: the CSS selector string
- specificity: a short label — one of "ID-based", "Attribute-based", "Class combination", "Structural"
- explanation: one sentence explaining why this selector was chosen

## Mode A — Target texts supplied
When target text strings are provided, return one group per string. Match segments whose element text CONTAINS the target string (case-insensitive substring match — not exact equality). The targetText field echoes back the user's original search string exactly as supplied.

If a target string matches multiple segments (e.g. duplicated elements for mobile/desktop), prefer the segment with the most stable unique selector attributes.

## Mode B — Auto-detect non-translatable text
When no target texts are supplied, analyze each segment's `element` field only. Extract the visible text content rendered inside the HTML tags (i.e. strip all HTML tags and read only the inner text). Do NOT use cssSelector, cssPath, class names, attribute values, or any other field as text candidates.

From the visible inner text found in `element` fields, identify text that is unlikely to be machine-translated:
- Proper names (people, companies, brands, product names)
- User-generated content (usernames, account identifiers, display names)
- Addresses, phone numbers, postal codes
- Legal entity names, registered trademarks
- Numeric codes, SKUs, order/reference numbers

Aim to identify 3–8 distinct non-translatable texts. Use the extracted inner text exactly as the targetText value. If the snapshot contains none, return an empty groups array and explain in the summary.

## Reconstruct HTML (conditional)
When asked to reconstruct HTML: examine the element HTML fragments in the snapshot and reconstruct what the original pre-translation HTML page structure would have looked like. Format as readable, indented HTML. Return it as the reconstructedHtml field. Omit this field entirely if not requested.

## Response schema
Respond with valid JSON matching this exact schema. No markdown fences, no extra keys:

{
  "groups": [
    {
      "targetText": "string",
      "good":   { "selector": "string", "specificity": "string", "explanation": "string" },
      "better": { "selector": "string", "specificity": "string", "explanation": "string" },
      "best":   { "selector": "string", "specificity": "string", "explanation": "string" }
    }
  ],
  "summary": "string",
  "reconstructedHtml": "string (omit field entirely if not requested)"
}

The summary should be 1–2 sentences: how many groups were produced, whether auto-detection or target matching was used, and overall confidence.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonInput, targetTexts, reconstructHtml } = body as {
      jsonInput: string;
      targetTexts?: string[];
      reconstructHtml?: boolean;
    };

    if (!jsonInput || typeof jsonInput !== "string") {
      return NextResponse.json({ error: "jsonInput is required" }, { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
    }

    const cleanedTargets = (targetTexts ?? []).map((t) => t.trim()).filter(Boolean);
    const hasTargets = cleanedTargets.length > 0;

    const targetSection = hasTargets
      ? `Target text strings to locate (substring match, one group per string):\n${cleanedTargets.map((t, i) => `${i + 1}. "${t}"`).join("\n")}`
      : "No target text provided — auto-detect non-translatable text elements.";

    const htmlSection = reconstructHtml
      ? "\nAlso reconstruct the original pre-translation HTML source from the snapshot."
      : "";

    const userMessage = [
      `Element snapshot JSON:\n${JSON.stringify(parsed, null, 2)}`,
      `\n${targetSection}${htmlSection}`,
    ].join("");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let result: GenerateResponse;
    try {
      result = JSON.parse(cleaned) as GenerateResponse;
    } catch {
      console.error("[/api/generate] raw model output:", rawText);
      return NextResponse.json(
        { error: "Model returned malformed JSON. Please try again." },
        { status: 500 }
      );
    }

    if (!Array.isArray(result.groups)) {
      console.error("[/api/generate] missing groups array:", result);
      return NextResponse.json(
        { error: "Model returned unexpected structure. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/generate]", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
