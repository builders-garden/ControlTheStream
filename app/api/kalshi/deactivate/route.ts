import { NextRequest, NextResponse } from "next/server";
import { deactivateKalshiEvent } from "@/lib/database/queries/kalshi.queries";

interface DeactivateKalshiRequest {
  eventId: string;
}

interface DeactivateKalshiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const body: DeactivateKalshiRequest = await req.json();
    const { eventId } = body;

    if (!eventId) {
      const errorResponse: DeactivateKalshiResponse = {
        success: false,
        error: "Event ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Deactivate the Kalshi event
    const deactivatedEvent = await deactivateKalshiEvent(eventId);

    if (!deactivatedEvent) {
      const errorResponse: DeactivateKalshiResponse = {
        success: false,
        error: "Failed to deactivate event or event not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const successResponse: DeactivateKalshiResponse = {
      success: true,
      message: "Kalshi event deactivated successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error deactivating Kalshi event:", error);
    const errorResponse: DeactivateKalshiResponse = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};
