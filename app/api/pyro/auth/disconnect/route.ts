import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { brandSlug } = await req.json();

    if (!brandSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand slug is required",
        },
        { status: 400 },
      );
    }

    // Note: We don't clear pyroMint/pyroEmail from DB on disconnect.
    // The values are preserved so the pyro creator check still works.
    return NextResponse.json({
      success: true,
      message: "Pyro account disconnected successfully",
    });
  } catch (error) {
    console.error("Pyro disconnect error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to disconnect Pyro account",
      },
      { status: 500 },
    );
  }
};
