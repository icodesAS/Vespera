import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/property";
import { DEFAULT_MODEL, extractText, getGenAI } from "@/lib/ai";

type SearchPayload = {
  query?: string;
  allProperties?: Property[];
};

export async function POST(req: NextRequest) {
  console.log("🔍 AI Search API called");
  
  try {
    const body = (await req.json()) as SearchPayload;
    const query = body.query?.trim();
    const allProperties = body.allProperties ?? [];

    console.log("📝 Query:", query);
    console.log("📦 Properties count:", allProperties.length);

    if (!query) {
      console.log("❌ No query provided");
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 }
      );
    }

    if (!allProperties.length) {
      console.log("⚠️ No properties available");
      return NextResponse.json({ properties: [] });
    }

    console.log("🤖 Initializing Vertex AI...");
    const genAI = getGenAI();
    console.log("✅ Vertex AI initialized");
    
    const prompt = `
You are assisting a renter with a natural language request.

User query:
"${query}"

Properties (JSON):
${JSON.stringify(allProperties, null, 2)}

Return ONLY a JSON array of property IDs ordered by relevance to the query.
The IDs must exactly match the "id" field from the properties above.
If no strong matches, still return an ordered array using the available IDs.

Example response format:
["prop-123", "prop-456", "prop-789"]
`;

    console.log("🚀 Sending request to Vertex AI...");
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

    console.log("✅ Received response from Vertex AI");

    const raw = extractText(result) || "[]";

    console.log("📝 Raw AI response:", raw);

    const ordered = mapOrder(raw, allProperties);
    console.log("✅ Ordered properties count:", ordered.length);

    return NextResponse.json({ properties: ordered });
  } catch (error) {
    console.error("❌ AI search error:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json(
      { 
        error: "AI search failed.", 
        details: error instanceof Error ? error.message : String(error) 
      },
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

  // Add remaining properties that weren't matched
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