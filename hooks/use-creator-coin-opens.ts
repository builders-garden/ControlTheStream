import type {
  CreateCreatorCoinOpen,
  CreatorCoinOpen,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";

interface CreatorCoinOpenApiResponse {
  success: boolean;
  data: CreatorCoinOpen;
}

// Mutation hooks
export const useCreateCreatorCoinOpen = (tokenType: AuthTokenType) => {
  return useApiMutation<CreatorCoinOpenApiResponse, CreateCreatorCoinOpen>({
    url: "/api/creator-coin-opens",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};
