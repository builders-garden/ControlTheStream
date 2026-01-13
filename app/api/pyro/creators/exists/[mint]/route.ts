import { NextRequest, NextResponse } from "next/server";

const PYRO_BASE_URL = process.env.PYRO_API_URL || "https://www.pyro.buzz";
const PYRO_API_URL = `${PYRO_BASE_URL}/api/backend/creators/exists`;

export interface PyroCreatorExistsResponse {
  success: boolean;
  exists: boolean;
  mint: string;
  creatorInfo?: {
    streamerUsername: string;
    isSplit: boolean;
  };
}

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
          exists: false,
          error: "Mint address is required",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.PYRO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          exists: false,
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
          exists: false,
          error: `Pyro API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data: PyroCreatorExistsResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Pyro creator exists check error:", error);
    return NextResponse.json(
      {
        success: false,
        exists: false,
        error: "Failed to check Pyro creator",
      },
      { status: 500 },
    );
  }
};
