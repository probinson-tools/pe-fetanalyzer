export type ModelChoice = "claude-haiku-4-5" | "claude-sonnet-4-6";

export interface GenerateRequest {
  jsonInput: string;
  targetTexts?: string[];
  reconstructHtml?: boolean;
  model?: ModelChoice;
}

export interface SelectorResult {
  selector: string;
  specificity: string;
  explanation: string;
}

export interface SelectorGroup {
  targetText: string;
  good: SelectorResult;
  better: SelectorResult;
  best: SelectorResult;
}

export interface GenerateResponse {
  groups: SelectorGroup[];
  summary: string;
  reconstructedHtml?: string;
}

export type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: GenerateResponse };
