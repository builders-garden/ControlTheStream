import { useApiMutation } from "./use-api-mutation";

// Types for API responses
type ZoraCoinApiResponse = {
  name?: string;
  symbol?: string;
  address?: string;
  description?: string;
  totalSupply?: string;
  totalVolume?: string;
  volume24h?: string;
  createdAt?: string;
  creatorAddress?: string;
  marketCap?: string;
  originalUri?: string;
  ipfsCid?: string;
};

// Request types
interface ZoraCoinRequest {
  address: string;
}

// Mutation hooks
export const useZoraCoin = () => {
  return useApiMutation<ZoraCoinApiResponse, ZoraCoinRequest>({
    url: (variables) => `/api/zora?address=${variables.address}`,
    method: "GET",
    tokenType: null, // No authentication required for getting Zora coin data
  });
};
