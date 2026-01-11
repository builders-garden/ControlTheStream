import { NextRequest, NextResponse } from "next/server";
import { updateBrand } from "@/lib/database/queries";

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

    // Clear Pyro info from brand
    const updatedBrand = await updateBrand(brandSlug, {
      pyroMint: null,
      pyroEmail: null,
    });

    if (!updatedBrand) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to disconnect Pyro account",
        },
        { status: 500 },
      );
    }

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
