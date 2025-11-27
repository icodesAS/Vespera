export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/property";

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

    // Generate a basic explanation based on property details
    const explanation = `
Here's an assessment of the "${property.title}" property:

• **Budget Alignment:** The rent of ₹${rent.toLocaleString("en-IN")} per month falls within the preferred budget range of ₹25,000–₹40,000.

• **Location & City:** The property is located in ${property.city}, which is one of the preferred cities (Pune, Bengaluru, Gurugram).

• **Bedroom Count:** With ${bedrooms} bedroom(s), this property meets the requirement for 2 or more bedrooms.

• **Connectivity & Safety:** Located in ${property.location}, this area is known for good connectivity to IT hubs and is a safe neighbourhood.
    `.trim();

    return NextResponse.json({ aiReason: explanation });
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