import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/zod";

const PYRO_BASE_URL = env.PYRO_API_URL;
const PYRO_API_KEY = env.PYRO_API_KEY;

export const POST = async (req: NextRequest) => {
  try {
    if (!PYRO_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Pyro API key not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    console.log("Burn request body:", body);

    const response = await fetch(`${PYRO_BASE_URL}/externalburn/burn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-External-API-Key": PYRO_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "Burn failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Pyro burn error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process burn" },
      { status: 500 },
    );
  }
};
