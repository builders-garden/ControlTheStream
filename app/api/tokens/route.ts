import { NextRequest, NextResponse } from "next/server";
import { BASE_APP_SUPPORTED_CHAINS } from "@/lib/constants";
import {
  Token,
  TokensApiError,
  TokensApiResponse,
} from "@/lib/types/tokens.type";
import { env } from "@/lib/zod";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // Get query parameters
    const chainName = searchParams.get("chain_name");
    const searchQuery = searchParams.get("search_query");
    const tokenAddress = searchParams.get("token_address");
    const pageSize = searchParams.get("page_size") || "20";
    const currency = searchParams.get("currency") || "usd";
    const sort = searchParams.get("sort") || "-market_data.market_cap";

    // Build the API URL
    const baseUrl = "https://api.zerion.io/v1/fungibles/";
    const params = new URLSearchParams({
      currency,
      "page[size]": pageSize,
      sort,
    });

    // Add optional filters
    if (chainName) {
      params.append("filter[implementation_chain_id]", chainName);
    }

    if (searchQuery) {
      params.append("filter[search_query]", searchQuery);
    }

    if (tokenAddress) {
      params.append("filter[implementation_address]", tokenAddress);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    // Make the API call to Zerion
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Basic ${env.ZERION_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Zerion API error: ${response.status} ${response.statusText}`,
      );
      return NextResponse.json(
        { success: false, error: `API request failed: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform the data to only include the required fields
    const transformedData: Token[] =
      data.data?.map((token: any) => {
        // If we filtered by chain, find the implementation for that specific chain
        let implementation = token.attributes.implementations?.[0];

        if (chainName && token.attributes.implementations) {
          const chainImplementation = token.attributes.implementations.find(
            (impl: any) => impl.chain_id === chainName,
          );
          if (chainImplementation) {
            implementation = chainImplementation;
          }
        }

        return {
          name: token.attributes.name,
          symbol: token.attributes.symbol,
          iconUrl: token.attributes.icon?.url,
          chainId: BASE_APP_SUPPORTED_CHAINS.find(
            (chain) => chain.zerionName === implementation?.chain_id,
          )?.chainId,
          address: implementation?.address,
          decimals: implementation?.decimals,
        };
      }) || [];

    const result: TokensApiResponse = {
      success: true,
      data: transformedData,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Zerion API error:", error);
    const errorResponse: TokensApiError = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};
