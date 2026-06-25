export interface GenerateRequest {
  jsonInput: string;
  targetText?: string;
}

export interface SelectorResult {
  selector: string;
  specificity: string;
  explanation: string;
}

export interface GenerateResponse {
  selectors: SelectorResult[];
  summary: string;
}

export type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: GenerateResponse };
