import { NextRequest, NextResponse } from "next/server";
import { createFeaturedTokenOpen } from "@/lib/database/queries";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.brandId || !data.openerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: brandId, openerId",
        },
        { status: 400 },
      );
    }

    const featuredTokenOpen = await createFeaturedTokenOpen(data);

    return NextResponse.json({
      success: true,
      data: featuredTokenOpen,
    });
  } catch (error) {
    console.error("Create featured token open error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create featured token open",
      },
      { status: 500 },
    );
  }
};
