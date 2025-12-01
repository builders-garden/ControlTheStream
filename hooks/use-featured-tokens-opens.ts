import type {
  CreateFeaturedTokenOpen,
  FeaturedTokenOpen,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";

interface FeaturedTokenOpenApiResponse {
  success: boolean;
  data: FeaturedTokenOpen;
}

// Mutation hooks
export const useCreateFeaturedTokenOpen = (tokenType: AuthTokenType) => {
  return useApiMutation<FeaturedTokenOpenApiResponse, CreateFeaturedTokenOpen>({
    url: "/api/featured-tokens-opens",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};
