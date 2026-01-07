import type {
  CreateTipSettings,
  TipSettings,
  UpdateTipSettings,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

interface TipSettingsApiResponse {
  success: boolean;
  data: TipSettings;
}

// Query hooks
export const useTipSettings = (params?: {
  brandId?: string;
  payoutAddress?: string;
  ensName?: string;
  baseName?: string;
  enabled?: boolean;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.payoutAddress)
    searchParams.set("payoutAddress", params.payoutAddress);
  if (params?.ensName) searchParams.set("ensName", params.ensName);
  if (params?.baseName) searchParams.set("baseName", params.baseName);

  const queryString = searchParams.toString();
  const url = `/api/tip-settings${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<TipSettingsApiResponse>({
    queryKey: ["tips", params],
    url,
    isProtected: true,
    enabled: params?.enabled ?? true,
    tokenType: null,
  });
};

// Mutation hooks
export const useCreateTipSettings = (tokenType: AuthTokenType) => {
  return useApiMutation<TipSettingsApiResponse, CreateTipSettings>({
    url: "/api/tip-settings",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};

export const useUpdateTipSettings = (tokenType: AuthTokenType) => {
  return useApiMutation<
    TipSettingsApiResponse,
    { tipId: string } & UpdateTipSettings
  >({
    url: (variables) => `/api/tip-settings/${variables.tipId}`,
    method: "PUT",
    body: (data) => data,
    tokenType,
  });
};

