import { useApiQuery } from "./use-api-query";

export interface ExternalSponsor {
  name: string;
  description?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  sponsorImageUrl?: string;
}

export interface PyroCommunity {
  _id: string;
  sponsorType: "token" | "external";
  externalSponsor?: ExternalSponsor;
  token?: {
    mint: string;
    name: string;
    symbol: string;
    iconUrl?: string;
  };
  totalAmountBurned: number;
  totalBurnCount: number;
  totalUsdBurnValue?: number;
  isActive: boolean;
}

interface PyroCommunitiesResponse {
  success: boolean;
  data?: PyroCommunity[];
  error?: string;
}

export const usePyroCommunities = ({
  enabled = true,
  sponsorType,
}: {
  enabled?: boolean;
  sponsorType?: "token" | "external";
} = {}) => {
  const url = sponsorType
    ? `/api/pyro/communities?sponsorType=${sponsorType}`
    : "/api/pyro/communities";

  return useApiQuery<PyroCommunitiesResponse>({
    queryKey: ["pyro-communities", sponsorType],
    url,
    enabled,
    isProtected: false,
    tokenType: null,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
