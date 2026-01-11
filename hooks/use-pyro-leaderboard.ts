import { PyroLeaderboardResponse } from "@/lib/types/pyro.types";
import { useApiQuery } from "./use-api-query";

interface PyroLeaderboardApiResponse {
  success: boolean;
  data: PyroLeaderboardResponse;
  error?: string;
}

export const usePyroLeaderboard = ({
  mint,
  enabled,
}: {
  mint?: string | null;
  enabled: boolean;
}) => {
  return useApiQuery<PyroLeaderboardApiResponse>({
    queryKey: ["pyro-leaderboard", mint],
    url: `/api/pyro/leaderboard/${mint}`,
    enabled: enabled && !!mint,
    isProtected: false,
    tokenType: null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
