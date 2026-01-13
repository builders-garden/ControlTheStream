import { NextRequest, NextResponse } from "next/server";

const PYRO_BASE_URL = process.env.PYRO_API_URL!;
const PYRO_API_URL = `${PYRO_BASE_URL}/communities`;

export interface ExternalSponsor {
  name: string;
  description?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  sponsorImageUrl?: string;
}

export interface PyroCommunity {
  _id: string;
  sponsorType: "token" | "external";
  externalSponsor?: ExternalSponsor;
  token?: {
    mint: string;
    name: string;
    symbol: string;
    iconUrl?: string;
  };
  totalAmountBurned: number;
  totalBurnCount: number;
  totalUsdBurnValue?: number;
  isActive: boolean;
}

export interface PyroCommunitiesResponse {
  success: boolean;
  data?: PyroCommunity[];
  error?: string;
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const sponsorType = searchParams.get("sponsorType");

    const apiKey = process.env.PYRO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Pyro API key not configured",
        },
        { status: 500 },
      );
    }

    const url = new URL(PYRO_API_URL);
    if (limit) {
      url.searchParams.set("limit", limit);
    }

    const response = await fetch(url.toString(), {
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

    const data: PyroCommunitiesResponse = await response.json();

    // Filter by sponsor type if specified
    if (sponsorType && data.data) {
      data.data = data.data.filter(
        (community) => community.sponsorType === sponsorType,
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Pyro communities fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Pyro communities",
      },
      { status: 500 },
    );
  }
};
