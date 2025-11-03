import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
import { getActiveKalshiEventsByBrand } from "@/lib/database/queries/kalshi.queries";
import { KalshiApiError, KalshiApiSuccess } from "@/lib/types/kalshi.type";
import { env } from "@/lib/zod";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      const errorResponse: KalshiApiError = {
        success: false,
        error: "Brand ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get current time from server
    const currentTimeResponse = await ky
      .get<{ timestamp: number }>(
        `${env.NEXT_PUBLIC_SOCKET_URL}/current-time`,
        {
          headers: {
            "x-api-secret": env.BACKEND_SECRET,
            "Content-Type": "application/json",
          },
        },
      )
      .json();

    const currentServerTime = currentTimeResponse.timestamp; // in milliseconds

    // Get active Kalshi events for the brand
    const activeEvents = await getActiveKalshiEventsByBrand(brandId);

    // Filter out events that have expired based on activatedAt + duration
    const nonExpiredEvents = activeEvents.filter((event) => {
      if (!event.activatedAt || !event.duration) {
        return true; // If no duration/activation time, consider it active
      }

      const activatedAtMs = new Date(event.activatedAt).getTime(); // Convert ISO to milliseconds
      const durationMs = event.duration * 1000; // Convert seconds to milliseconds
      const endTime = activatedAtMs + durationMs;

      // Event is still active if current time is before end time
      return currentServerTime < endTime;
    });

    // If no non-expired events, return success with null data
    if (nonExpiredEvents.length === 0) {
      const successResponse = {
        success: true,
        data: null,
      };
      return NextResponse.json(successResponse);
    }

    // Return the first non-expired event
    const activeEvent = nonExpiredEvents[0];

    // Transform the database event to match the expected API response format
    const successResponse: KalshiApiSuccess = {
      success: true,
      data: {
        eventId: activeEvent.id, // Include event ID for deactivation
        eventTitle: activeEvent.eventTitle,
        markets: [], // Empty markets array since we're not fetching live data
        totalMarkets: activeEvent.totalMarkets,
        kalshiUrl: activeEvent.kalshiUrl,
        duration: activeEvent.duration ? activeEvent.duration / 60 : undefined, // Convert seconds to minutes
        activatedAt: activeEvent.activatedAt || undefined, // ISO string
      },
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching active Kalshi events:", error);
    const errorResponse: KalshiApiError = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};
