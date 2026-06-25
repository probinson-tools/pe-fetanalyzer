import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { GenerateResponse, SelectorResult } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert at analyzing DOM element snapshots and generating optimal CSS selectors.

Given a JSON array of element snapshots (each with cssSelector, cssPath, and element HTML fields) and an optional target text, you generate the most specific, stable CSS selectors for targeting those elements.

Selector preference order:
1. ID-based selectors (#id) — most stable
2. Unique attribute selectors ([data-testid="..."], [aria-label="..."], etc.)
3. Unique class combinations (.parent .child)
4. Structural/positional selectors (nth-child) — least preferred, use only when necessary

For each selector, provide:
- The CSS selector string
- A brief specificity label (e.g., "ID-based", "Attribute-based", "Class combination", "Structural")
- A one-sentence explanation of why this selector was chosen

Respond with valid JSON matching this exact schema:
{
  "selectors": [
    {
      "selector": "string",
      "specificity": "string",
      "explanation": "string"
    }
  ],
  "summary": "string"
}

The summary should be 1-2 sentences describing the overall approach and confidence level.
Return only the JSON object, no markdown fences.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonInput, targetText } = body as { jsonInput: string; targetText?: string };

    if (!jsonInput || typeof jsonInput !== "string") {
      return NextResponse.json({ error: "jsonInput is required" }, { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
    }

    const userMessage = [
      `Element snapshot JSON:\n${JSON.stringify(parsed, null, 2)}`,
      targetText?.trim()
        ? `\nTarget text to find: "${targetText.trim()}"`
        : "\nNo specific target text provided — generate selectors for all elements in the snapshot.",
    ].join("");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6-20251101",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    let result: GenerateResponse;
    try {
      result = JSON.parse(rawText) as GenerateResponse;
    } catch {
      return NextResponse.json(
        { error: "Model returned malformed JSON. Please try again." },
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
