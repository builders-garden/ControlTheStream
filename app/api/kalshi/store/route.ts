import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreateKalshiEvent } from "@/lib/database/db.schema";
import { getBrandById } from "@/lib/database/queries/brand.query";
import {
  activateKalshiEvent,
  createKalshiEvent,
  getKalshiEventByBrandAndEventId,
  updateKalshiEvent,
} from "@/lib/database/queries/kalshi.queries";

// Validation schema for the request body
const storeKalshiSchema = z.object({
  brandId: z.string().min(1),
  kalshiData: z.object({
    eventTitle: z.string().min(1),
    totalMarkets: z.number().min(1),
  }),
  kalshiUrl: z.string().url(),
  duration: z.number().min(1).max(60).optional(), // Duration in minutes, optional
});

export const POST = async (req: NextRequest) => {
  try {
    // Get wallet address from headers
    const walletAddress = req.headers.get("x-user-wallet-address");
    const body = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 },
      );
    }

    // Validate request body
    const parsed = storeKalshiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.message },
        { status: 400 },
      );
    }

    const { brandId, kalshiData, kalshiUrl, duration } = parsed.data;

    // Verify brand exists
    const brand = await getBrandById(brandId);
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    // Extract event ID from URL for uniqueness check
    const urlParts = kalshiUrl.split("/");
    const kalshiEventId = urlParts[urlParts.length - 1]?.toUpperCase();

    if (!kalshiEventId) {
      return NextResponse.json(
        { success: false, error: "Invalid Kalshi URL format" },
        { status: 400 },
      );
    }

    // Get current time from server to check if events are expired
    const currentTimeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/current-time`,
      {
        headers: {
          "x-api-secret": process.env.BACKEND_SECRET!,
          "Content-Type": "application/json",
        },
      },
    );
    const currentTime = await currentTimeResponse.json();
    const currentServerTime = currentTime.timestamp; // in milliseconds

    // Check if this event already exists for this brand
    const existingEvent = await getKalshiEventByBrandAndEventId(
      brandId,
      kalshiEventId,
    );

    if (existingEvent) {
      // Check if the event is expired (if it's active and has duration + activatedAt)
      let isExpired = false;
      if (
        existingEvent.status === "active" &&
        existingEvent.duration &&
        existingEvent.activatedAt
      ) {
        const activatedAtMs = new Date(existingEvent.activatedAt).getTime();
        const durationMs = existingEvent.duration * 1000; // Convert seconds to milliseconds
        const endTime = activatedAtMs + durationMs;
        isExpired = currentServerTime >= endTime;
      }

      // If event exists and is inactive, OR if it's expired, reactivate it
      if (existingEvent.status === "inactive" || isExpired) {
        // Reactivate the event if it's inactive
        if (existingEvent.status === "inactive") {
          await activateKalshiEvent(existingEvent.id);
        }

        // Get current time from server (use the one we already fetched)
        // Update duration and activatedAt if provided
        if (duration) {
          await updateKalshiEvent(existingEvent.id, {
            duration: duration * 60, // Convert minutes to seconds
            activatedAt: new Date(currentTime.timestamp).toISOString(),
          });
        } else {
          // Just update activatedAt with current time
          await updateKalshiEvent(existingEvent.id, {
            activatedAt: new Date(currentTime.timestamp).toISOString(),
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            eventId: existingEvent.id,
            totalMarkets: existingEvent.totalMarkets,
            message: isExpired
              ? "Expired Kalshi event reactivated successfully"
              : "Kalshi event reactivated successfully",
          },
        });
      }

      // If event exists and is already active AND not expired, return conflict
      return NextResponse.json(
        {
          success: false,
          error: "This Kalshi event is already active for this brand",
        },
        { status: 409 },
      );
    }

    // Event doesn't exist, create it (currentTime was already fetched above)
    const eventData: CreateKalshiEvent = {
      brandId,
      kalshiEventId,
      kalshiUrl,
      eventTitle: kalshiData.eventTitle,
      totalMarkets: kalshiData.totalMarkets,
      duration: duration ? duration * 60 : null, // Store duration in seconds (convert from minutes)
      activatedAt: new Date(currentTime.timestamp).toISOString(), // ISO string from server
    };

    // Create the event (it will be active by default)
    const result = await createKalshiEvent(eventData);

    return NextResponse.json({
      success: true,
      data: {
        eventId: result.id,
        totalMarkets: result.totalMarkets,
        message: "Kalshi event stored successfully",
      },
    });
  } catch (error) {
    console.error("Error storing Kalshi event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
