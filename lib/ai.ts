import { GoogleGenAI } from "@google/genai";

export const DEFAULT_MODEL =
  process.env.GEMINI_MODEL ||
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.8-flash";

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  return new GoogleGenAI({ apiKey });
}
export function extractText(result: unknown): string {
  if (!result || typeof result !== "object") return "";
  const r = result as { text?: string | (() => string) };
  if (typeof r.text === "function") return r.text().trim();
  if (typeof r.text === "string") return r.text.trim();
  return "";
}
