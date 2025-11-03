import { NextRequest, NextResponse } from "next/server";
import {
  KalshiApiError,
  KalshiApiResponse,
  KalshiApiSuccess,
} from "@/lib/types/kalshi.type";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      const errorResponse: KalshiApiError = {
        success: false,
        error: "URL is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Extract the event ID from the URL
    const urlParts = url.split("/");
    const eventId = urlParts[urlParts.length - 1];

    if (!eventId) {
      const errorResponse: KalshiApiError = {
        success: false,
        error: "Invalid Kalshi URL format",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Convert to uppercase if not already
    const eventIdUpper = eventId.toUpperCase();

    // Call the Kalshi API
    const kalshiApiUrl = `https://api.elections.kalshi.com/trade-api/v2/events/${eventIdUpper}`;

    const response = await fetch(kalshiApiUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Kalshi API error: ${response.status} ${response.statusText}`,
      );
      const errorResponse: KalshiApiError = {
        success: false,
        error: `Kalshi API request failed: ${response.statusText}`,
      };
      return NextResponse.json(errorResponse, { status: response.status });
    }

    const data: KalshiApiResponse = await response.json();

    // Extract market data for display, sorted by highest yes price first
    const marketData = data.markets
      .filter((market) => market.status === "active") // Filter out finalized markets
      .map((market) => ({
        title: market.title,
        yesPrice: market.yes_bid_dollars,
        noPrice: market.no_bid_dollars,
        status: market.status,
        ticker: market.ticker,
        noSubTitle: market.no_sub_title,
        closeTime: market.close_time,
      }))
      .sort((a, b) => parseFloat(b.yesPrice) - parseFloat(a.yesPrice)); // Sort by highest yes price first

    const successResponse: KalshiApiSuccess = {
      success: true,
      data: {
        eventTitle: data.event.title,
        markets: marketData,
        totalMarkets: data.markets.length,
        kalshiUrl: url,
      },
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Kalshi API error:", error);
    const errorResponse: KalshiApiError = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};
