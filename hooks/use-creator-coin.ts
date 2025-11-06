import { CreatorCoin } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface CreatorCoinsApiResponse {
  success: boolean;
  data: CreatorCoin[];
}

interface CreateCreatorCoinApiResponse {
  success: boolean;
  data: CreatorCoin;
}

interface DeleteCreatorCoinApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Request types
interface CreateCreatorCoinRequest {
  brandId: string;
  address: string;
  chainId: number;
  symbol: string;
  name: string;
  logoUrl?: string;
}

interface DeleteCreatorCoinRequest {
  coinId: string;
}

// Query hook for getting creator coins
export const useCreatorCoins = (brandId?: string, enabled: boolean = true) => {
  const url = brandId
    ? `/api/creator-coin?brandId=${brandId}`
    : "/api/creator-coin";

  return useApiQuery<CreatorCoinsApiResponse>({
    queryKey: ["creator-coins", brandId],
    url,
    enabled: enabled && !!brandId,
    isProtected: true,
    tokenType: null,
  });
};

// Mutation hook for creating a creator coin
export const useCreateCreatorCoin = () => {
  return useApiMutation<CreateCreatorCoinApiResponse, CreateCreatorCoinRequest>(
    {
      url: "/api/creator-coin",
      method: "POST",
      body: (variables) => variables,
      tokenType: null, // Authentication is handled via headers in the API
      isProtected: true, // Send credentials for authentication
    },
  );
};

// Mutation hook for deleting a creator coin
export const useDeleteCreatorCoin = () => {
  return useApiMutation<DeleteCreatorCoinApiResponse, DeleteCreatorCoinRequest>(
    {
      url: (variables) => `/api/creator-coin?coinId=${variables.coinId}`,
      method: "DELETE",
      tokenType: null, // Authentication is handled via middleware
      isProtected: true, // Send credentials for authentication
    },
  );
};
