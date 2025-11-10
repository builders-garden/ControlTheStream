import { NextRequest, NextResponse } from "next/server";
import { base } from "viem/chains";
import { ZoraService } from "@/lib/zora/zora";

const zoraService = new ZoraService();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const coin = await zoraService.getCoin(address, base.id);

    // Only return 200 if the coin has an address
    if (!coin?.address) {
      return NextResponse.json(
        { error: "Coin not found on Zora" },
        { status: 404 },
      );
    }

    // Extract originalUri from mediaContent, default to empty string if not present
    const originalUri = coin?.mediaContent?.originalUri || "";

    // Extract IPFS CID from originalUri (remove "ipfs://" prefix if present)
    // Store only the CID in the database, without any gateway URL
    let ipfsCid = "";
    if (originalUri) {
      // Remove "ipfs://" prefix if present to get just the CID
      ipfsCid = originalUri.replace(/^ipfs:\/\//, "");
    }

    // Return the coin data with originalUri and ipfsCid (CID only, no gateway URL)
    return NextResponse.json({
      ...coin,
      originalUri,
      ipfsCid,
    });
  } catch (error) {
    console.error("Error fetching coin:", error);
    // If coin is not found, return 404 instead of 500
    if (error instanceof Error && error.message === "Coin not found") {
      return NextResponse.json(
        { error: "Coin not found on Zora" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch coin" },
      { status: 500 },
    );
  }
}
