import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
type KalshiGetApiResponse = KalshiApiResult;

interface KalshiStoreApiResponse {
  success: boolean;
  data: {
    eventId: string;
    totalMarkets: number;
    message: string;
  };
}

// Request types
interface KalshiGetRequest {
  url: string;
}

interface KalshiStoreRequest {
  brandId: string;
  kalshiData: {
    eventTitle: string;
    totalMarkets: number;
  };
  kalshiUrl: string;
  duration?: number; // Duration in minutes
}

interface KalshiDeactivateRequest {
  eventId: string;
}

interface KalshiDeactivateApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Mutation hooks
export const useKalshiGet = () => {
  return useApiMutation<KalshiGetApiResponse, KalshiGetRequest>({
    url: "/api/kalshi/get",
    method: "POST",
    body: (variables) => variables,
    tokenType: null, // No authentication required for getting Kalshi data
  });
};

export const useKalshiStore = () => {
  return useApiMutation<KalshiStoreApiResponse, KalshiStoreRequest>({
    url: "/api/kalshi/store",
    method: "POST",
    body: (variables) => variables,
    tokenType: null, // Authentication is handled via headers in the API
  });
};

// Query hook for active Kalshi events
export const useActiveKalshiEvent = (brandId: string) => {
  return useApiQuery<KalshiGetApiResponse>({
    queryKey: ["active-kalshi-event", brandId],
    url: `/api/kalshi/active?brandId=${brandId}`,
    enabled: !!brandId,
    isProtected: true,
    tokenType: null,
  });
};

// Mutation hook for deactivating Kalshi events
export const useKalshiDeactivate = () => {
  return useApiMutation<KalshiDeactivateApiResponse, KalshiDeactivateRequest>({
    url: "/api/kalshi/deactivate",
    method: "POST",
    body: (variables) => variables,
    tokenType: null, // Authentication is handled via middleware
    isProtected: true, // Send credentials for authentication
  });
};
