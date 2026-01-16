import { NextRequest, NextResponse } from "next/server";
import { PyroLeaderboardResponse } from "@/lib/types/pyro.types";
import { env } from "@/lib/zod";

const PYRO_BASE_URL = env.PYRO_API_URL;
const PYRO_API_URL = `${PYRO_BASE_URL}/leaderboard`;

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) => {
  try {
    const { mint } = await params;

    if (!mint) {
      return NextResponse.json(
        {
          success: false,
          error: "Mint address is required",
        },
        { status: 400 },
      );
    }

    const apiKey = env.PYRO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Pyro API key not configured",
        },
        { status: 500 },
      );
    }

    const response = await fetch(`${PYRO_API_URL}/${mint}`, {
      method: "GET",
      headers: {
        "X-External-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Pyro API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data: PyroLeaderboardResponse = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Pyro leaderboard fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Pyro leaderboard",
      },
      { status: 500 },
    );
  }
};
