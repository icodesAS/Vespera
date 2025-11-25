import { GoogleGenAI } from "@google/genai";

export function getGenAI() {
  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION;

  if (useVertex) {
    if (!project || !location) {
      throw new Error(
        "Vertex AI requires GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION."
      );
    }

    return new GoogleGenAI({
      vertexai: true,
      project,
      location,
    });
  }

  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY or GEMINI_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

export const DEFAULT_MODEL = "gemini-2.5-flash";

