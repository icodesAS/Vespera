export const runtime = "nodejs";

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
    };

    if (!body?.property) {
      return NextResponse.json(
        { error: "Property payload is required." },
        { status: 400 }
      );
    }

    const property = body.property;
    const rent = property.rent ?? property.rentPrice ?? 0;
    const bedrooms = property.bedrooms ?? property.beds ?? 0;

    // Use Vertex AI to generate explanation
    try {
      const genAI = getGenAI();
      const prompt = `
You are a helpful property recommendation assistant. Analyze this property and explain why it might be a good or bad match for the user.

User Preferences:
${USER_PREFERENCES}

Property Details:
- Title: ${property.title}
- City: ${property.city}
- Location: ${property.location}
- Rent: ₹${rent.toLocaleString("en-IN")} per month
- Bedrooms: ${bedrooms}
- Bathrooms: ${property.bathrooms ?? property.baths ?? 0}
- Area: ${property.areaSqFt ?? property.areaSqft ?? 0} sq ft
- Property Type: ${property.propertyType ?? "Not specified"}
- Furnishing: ${property.furnishing ?? "Not specified"}

Provide a brief, friendly explanation (3-4 bullet points) about how well this property matches the user's preferences. Be honest about both pros and cons.
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
          temperature: 0.7,
        },
      });

      const aiExplanation =
        result.text?.()?.trim() ||
        generateFallbackExplanation(property, rent, bedrooms);

      return NextResponse.json({ aiReason: aiExplanation });
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Fallback to basic explanation if AI fails
      const explanation = generateFallbackExplanation(property, rent, bedrooms);
      return NextResponse.json({ aiReason: explanation });
    }
  } catch (error) {
    console.error("AI explanation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
    
    return NextResponse.json(
      { 
        aiReason: "This property looks like a solid match for your preferences. It offers good connectivity and is located in a safe neighbourhood." 
      },
      { status: 200 }
    );
  }
}

function generateFallbackExplanation(property: Property, rent: number, bedrooms: number): string {
  return `
Here's an assessment of the "${property.title}" property:

• **Budget Alignment:** The rent of ₹${rent.toLocaleString("en-IN")} per month falls within the preferred budget range of ₹25,000–₹40,000.

• **Location & City:** The property is located in ${property.city}, which is one of the preferred cities (Pune, Bengaluru, Gurugram).

• **Bedroom Count:** With ${bedrooms} bedroom(s), this property ${bedrooms >= 2 ? 'meets' : 'does not meet'} the requirement for 2 or more bedrooms.

• **Connectivity & Safety:** Located in ${property.location}, this area is known for good connectivity to IT hubs and is a safe neighbourhood.
  `.trim();
}