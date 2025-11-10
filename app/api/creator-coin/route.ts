import { NextRequest, NextResponse } from "next/server";
import { CreateCreatorCoin, CreatorCoin } from "@/lib/database/db.schema";
import {
  createCreatorCoin,
  deleteCreatorCoin,
  getAllCreatorCoins,
  getCreatorCoinsByBrand,
} from "@/lib/database/queries/creatorCoin.query";

/**
 * GET /api/creator-coin
 * Get all creator coins, optionally filtered by brandId
 */
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");

    let coins: CreatorCoin[];

    if (brandId) {
      coins = await getCreatorCoinsByBrand(brandId);
    } else {
      coins = await getAllCreatorCoins();
    }

    return NextResponse.json({
      success: true,
      data: coins,
    });
  } catch (error) {
    console.error("Get creator coins error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch creator coins",
      },
      { status: 500 },
    );
  }
};

/**
 * POST /api/creator-coin
 * Create a new creator coin
 */
export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Validation
    if (
      !data.brandId ||
      !data.address ||
      !data.chainId ||
      !data.symbol ||
      !data.name
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: brandId, address, chainId, symbol, name",
        },
        { status: 400 },
      );
    }

    // Create the creator coin
    const coin = await createCreatorCoin(data as CreateCreatorCoin);

    return NextResponse.json({
      success: true,
      data: coin,
    });
  } catch (error) {
    console.error("Create creator coin error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create creator coin",
      },
      { status: 500 },
    );
  }
};

/**
 * DELETE /api/creator-coin
 * Delete a creator coin by ID
 */
export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get("coinId");

    // Validation
    if (!coinId) {
      return NextResponse.json(
        {
          success: false,
          error: "coinId is required",
        },
        { status: 400 },
      );
    }

    // Delete the creator coin
    const deleted = await deleteCreatorCoin(coinId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Creator coin not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Creator coin deleted successfully",
    });
  } catch (error) {
    console.error("Delete creator coin error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete creator coin",
      },
      { status: 500 },
    );
  }
};
