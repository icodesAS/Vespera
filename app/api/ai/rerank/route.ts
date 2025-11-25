import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/property";
import { DEFAULT_MODEL, getGenAI } from "@/lib/ai";

type RerankPayload = {
  liked?: Property[];
  disliked?: Property[];
  remaining?: Property[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RerankPayload;
    const liked = body.liked ?? [];
    const disliked = body.disliked ?? [];
    const remaining = body.remaining ?? [];

    if (!remaining.length) {
      return NextResponse.json({ properties: remaining });
    }

    const genAI = getGenAI();
    const prompt = `
You are re-ranking rental listings for a renter. 
- "liked" are the homes they swiped right on.
- "disliked" are the ones they skipped.
- "remaining" are the homes they have not seen.

Infer the user's preferences (budget, city, bedrooms, amenities) and return ONLY a JSON array with the IDs from "remaining" sorted from most promising to least promising.

liked:
${JSON.stringify(liked, null, 2)}

disliked:
${JSON.stringify(disliked, null, 2)}

remaining:
${JSON.stringify(remaining, null, 2)}

Output format example:
["12","5","3"]
`;

    const result = await genAI.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    });

    const raw =
      result.response?.text?.trim?.() ||
      result.text?.trim?.() ||
      "[]";

    const reordered = reconcileOrder(raw, remaining);

    return NextResponse.json({ properties: reordered });
  } catch (error) {
    console.error("AI rerank error:", error);
    return NextResponse.json(
      { error: "Failed to refine property order." },
      { status: 500 }
    );
  }
}

function reconcileOrder(raw: string, remaining: Property[]) {
  const clean = extractJsonArray(raw);
  const map = new Map(remaining.map((prop) => [prop.id, prop]));

  const ordered: Property[] = [];
  clean.forEach((id) => {
    const prop = map.get(id);
    if (prop) {
      ordered.push(prop);
      map.delete(id);
    }
  });

  // Append any properties Gemini didn't mention to avoid losing inventory.
  map.forEach((prop) => ordered.push(prop));

  return ordered.length ? ordered : remaining;
}

function extractJsonArray(raw: string): string[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => String(entry).trim())
        .filter((entry) => entry.length > 0);
    }
  } catch (error) {
    console.warn("Failed to parse rerank JSON:", error);
  }

  return [];
}

