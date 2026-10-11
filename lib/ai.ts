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

