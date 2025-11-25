import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/property";
import { DEFAULT_MODEL, getGenAI } from "@/lib/ai";

const USER_PREFERENCES = `
Budget: ₹25,000–₹40,000 per month
Preferred cities: Pune, Bengaluru, Gurugram
Bedrooms: 2 or more
Other: modern interiors, good connectivity to IT hubs, safe neighbourhood.
`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      property?: Property;
      preferenceText?: string;
    };

    if (!body?.property) {
      return NextResponse.json(
        { error: "Property payload is required." },
        { status: 400 }
      );
    }

    const genAI = getGenAI();

    const userPreferences = body.preferenceText
      ? `User's specific preferences: ${body.preferenceText}\n\nGeneral preferences:\n${USER_PREFERENCES}`
      : `User preferences:\n${USER_PREFERENCES}`;

    const prompt = `
You are an AI real-estate assistant.

${userPreferences}

Given this property, explain in 3–4 bullet points why it is or isn't a good match:

${JSON.stringify(body.property, null, 2)}
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
        temperature: 0.4,
      },
    });

    const aiReason =
      result.response?.text?.trim?.() ||
      result.text?.trim?.() ||
      "Looks like a solid match for your preferences.";

    return NextResponse.json({ aiReason });
  } catch (error) {
    console.error("AI explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI explanation." },
      { status: 500 }
    );
  }
}
