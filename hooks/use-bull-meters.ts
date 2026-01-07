import type {
  BullMeter,
  CreateBullMeter,
  UpdateBullMeter,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface BullMetersApiResponse {
  success: boolean;
  data: BullMeter[] | Array<{ bullMeter: BullMeter; brand: any }>;
}

interface BullMeterApiResponse {
  success: boolean;
  data: BullMeter;
}

// Query hooks
export const useActiveBullMeter = (brandId: string) => {
  return useApiQuery<BullMeterApiResponse>({
    queryKey: ["active-bullmeter", brandId],
    url: `/api/bullmeters/active/${brandId}`,
    enabled: !!brandId,
    isProtected: true,
    tokenType: null,
  });
};
