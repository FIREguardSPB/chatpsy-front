export interface AnonymizationResult {
  anonymized: string;
  mapping: Record<string, string>;
}

export type FileStatus = "idle" | "loaded" | "error";

export interface ChatPayload {
  anonymizedText: string;
  rawPreview: string;
  anonPreview: string;
  mapping: Record<string, string>;
}
