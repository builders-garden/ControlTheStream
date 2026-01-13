import { useApiQuery } from "./use-api-query";

interface PyroCreatorExistsResponse {
  success: boolean;
  exists: boolean;
  mint: string;
  creatorInfo?: {
    streamerUsername: string;
    isSplit: boolean;
  };
  error?: string;
}

export const usePyroCreatorExists = ({
  mint,
  enabled = true,
}: {
  mint?: string | null;
  enabled?: boolean;
}) => {
  return useApiQuery<PyroCreatorExistsResponse>({
    queryKey: ["pyro-creator-exists", mint],
    url: `/api/pyro/creators/exists/${mint}`,
    enabled: enabled && !!mint,
    isProtected: false,
    tokenType: null,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};
