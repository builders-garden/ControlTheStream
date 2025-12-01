import { NextRequest, NextResponse } from "next/server";
import { createCreatorCoinOpen } from "@/lib/database/queries";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (
      !data.brandId ||
      !data.openerId ||
      !data.address ||
      !data.chainId ||
      !data.symbol ||
      !data.name
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required field: brandId, openerId, address, chainId, symbol, name",
        },
        { status: 400 },
      );
    }

    const creatorCoinOpen = await createCreatorCoinOpen(data);

    return NextResponse.json({
      success: true,
      data: creatorCoinOpen,
    });
  } catch (error) {
    console.error("Create creator coin open error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create creator coin open",
      },
      { status: 500 },
    );
  }
};
