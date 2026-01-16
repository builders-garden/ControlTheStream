import { createBaseAccountSDK } from "@base-org/account";
import ky from "ky";
import { useCallback, useState } from "react";
import { encodeFunctionData } from "viem";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";
import { env } from "@/lib/zod";

interface SendCallsCall {
  to: string;
  value: string;
  data?: string;
}

interface SendCallsParams {
  version: string;
  from: string;
  chainId: string;
  atomicRequired: boolean;
  calls: SendCallsCall[];
  capabilities: {
    paymasterService: {
      url: string;
    };
  };
}

interface ClaimBullmetersResponse {
  success: boolean;
  data?: {
    address: string;
    lastNonce: number;
    totalPolls: number;
    pollIds: string[];
    polls: any[];
  };
  error?: string;
}

// Helper function to create wallet_sendCalls parameters
const createSendCallsParams = (
  fromAddress: string,
  chainId: string,
  calls: SendCallsCall[],
  atomicRequired: boolean = true,
): SendCallsParams => {
  return {
    version: "2.0.0",
    from: fromAddress,
    chainId,
    atomicRequired,
    calls,
    capabilities: {
      paymasterService: {
        url: env.NEXT_PUBLIC_PAYMASTER_URL,
      },
    },
  };
};

// Helper function to execute batch transactions
const executeBatchTransactionHelper = async (
  provider: any,
  address: string,
  chainId: string,
  calls: SendCallsCall[],
  atomicRequired: boolean = true,
) => {
  const sendCallsParams = createSendCallsParams(
    address,
    chainId,
    calls,
    atomicRequired,
  );

  try {
    const result = await provider.request({
      method: "wallet_sendCalls",
      params: [sendCallsParams],
    });

    console.log("Batch transaction successful:", result);
    return { success: true, result };
  } catch (error: any) {
    console.error("Batch transaction failed:", error);

    // Handle specific error types
    let errorMessage = "Unknown error occurred";

    if (error.code === 4001) {
      errorMessage = "User rejected the batch transaction";
    } else if (error.code === -32602) {
      errorMessage = "Invalid parameters for wallet_sendCalls";
    } else if (error.code === -32601) {
      errorMessage = "wallet_sendCalls method not supported by this wallet";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage, originalError: error };
  }
};

export const useBullmeterClaim = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWalletConnection = useCallback(async () => {
    const provider = createBaseAccountSDK({}).getProvider();

    // Request account access
    const addresses = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!addresses) {
      throw new Error("No accounts available");
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      throw new Error("No accounts available");
    }

    const address: string = addresses[0];

    // Switch to Base chain
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });

    return { provider, address };
  }, []);

  const executeBatch = useCallback(
    async (calls: SendCallsCall[], operation: string) => {
      const { provider, address } = await getWalletConnection();

      const batchResult = await executeBatchTransactionHelper(
        provider,
        address,
        "0x2105", // Base chain ID (8453 in hex)
        calls,
        true, // atomicRequired - all transactions must succeed or all fail
      );

      if (batchResult.success) {
        console.log(
          `${operation} transaction completed successfully:`,
          batchResult.result,
        );
        return { success: true, result: batchResult.result };
      } else {
        console.error(`${operation} transaction failed:`, batchResult.error);
        throw new Error(`${operation} failed: ${batchResult.error}`);
      }
    },
    [getWalletConnection],
  );

  const claimAllBullmeters = useCallback(
    async (address: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch claimable polls from the API
        const response = await ky.get<ClaimBullmetersResponse>(
          `/api/claim-bullmeters?address=${address}`,
          { timeout: false },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch claimable polls: ${response.status} ${errorData.error}`,
          );
        }

        const data = await response.json();

        if (!data.success || !data.data) {
          throw new Error(data.error || "Failed to fetch claimable polls");
        }

        const { totalPolls, pollIds } = data.data;

        if (totalPolls === 0 || pollIds.length === 0) {
          console.log("No claimable polls found");
          return { success: true, result: { totalPolls: 0, claimedPolls: 0 } };
        }

        console.log(`Found ${totalPolls} claimable polls:`, pollIds);

        // Create batch of transactions for each poll ID
        const calls: SendCallsCall[] = pollIds.map((pollId) => {
          const encodedFunctionCall = encodeFunctionData({
            abi: bullMeterAbi,
            functionName: "claimFundAndTerminate",
            args: [pollId as `0x${string}`],
          });

          return {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: encodedFunctionCall,
          };
        });

        // Execute the batch transaction
        const batchResult = await executeBatch(calls, "Claim all bullmeters");

        if (batchResult.success) {
          console.log(
            `✅ Successfully claimed funds from ${pollIds.length} polls`,
          );
          return {
            success: true,
            result: {
              totalPolls,
              claimedPolls: pollIds.length,
              pollIds,
            },
          };
        } else {
          throw new Error("Batch transaction failed");
        }
      } catch (err: any) {
        console.error("Claim all bullmeters error:", err);
        setError(err.message || "Failed to claim bullmeters");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch],
  );

  return {
    claimAllBullmeters,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
