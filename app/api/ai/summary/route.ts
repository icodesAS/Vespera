import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/property";
import { DEFAULT_MODEL, getGenAI } from "@/lib/ai";

type SummaryPayload = {
  selected?: Property[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummaryPayload;
    const selected = body.selected ?? [];

    if (!selected.length) {
      return NextResponse.json(
        { error: "At least one selected property is required." },
        { status: 400 }
      );
    }

    const genAI = getGenAI();
    const prompt = `
You are an assistant helping a renter evaluate shortlisted homes.

Selected homes:
${JSON.stringify(selected, null, 2)}

Summarise why these match the renter's preferences, highlight trade-offs, and suggest the strongest 2-3 candidates.
Keep the tone friendly and concise (max ~120 words).
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
        temperature: 0.6,
      },
    });

    const summary =
      result.response?.text?.trim?.() ||
      result.text?.trim?.() ||
      "These look like great picks already!";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json(
      { error: "Failed to summarise selected homes." },
      { status: 500 }
    );
  }
}

