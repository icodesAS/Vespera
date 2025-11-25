import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/property";
import { DEFAULT_MODEL, getGenAI } from "@/lib/ai";

type SearchPayload = {
  query?: string;
  allProperties?: Property[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchPayload;
    const query = body.query?.trim();
    const allProperties = body.allProperties ?? [];

    if (!query) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 }
      );
    }

    if (!allProperties.length) {
      return NextResponse.json({ properties: [] });
    }

    const genAI = getGenAI();
    const prompt = `
You are assisting a renter with a natural language request.

User query:
"${query}"

Properties (JSON):
${JSON.stringify(allProperties, null, 2)}

Return ONLY a JSON array of property IDs ordered by relevance to the query.
If no strong matches, still return an ordered array using the available IDs.
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
        temperature: 0.3,
      },
    });

    const raw =
      result.response?.text?.trim?.() ||
      result.text?.trim?.() ||
      "[]";

    const ordered = mapOrder(raw, allProperties);

    return NextResponse.json({ properties: ordered });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "AI search failed." },
      { status: 500 }
    );
  }
}

function mapOrder(raw: string, all: Property[]) {
  const ids = extractIds(raw);
  const map = new Map(all.map((prop) => [prop.id, prop]));

  const ordered: Property[] = [];
  ids.forEach((id) => {
    const prop = map.get(id);
    if (prop) {
      ordered.push(prop);
      map.delete(id);
    }
  });

  map.forEach((prop) => ordered.push(prop));
  return ordered;
}

function extractIds(raw: string): string[] {
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
        .filter(Boolean);
    }
  } catch (error) {
    console.warn("Failed to parse search JSON:", error);
  }

  return [];
}

