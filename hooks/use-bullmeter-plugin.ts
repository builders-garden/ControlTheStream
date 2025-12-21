import { createBaseAccountSDK } from "@base-org/account";
import ky from "ky";
import { Attribution } from "ox/erc8021";
import { useCallback, useState } from "react";
import {
  Address,
  decodeFunctionResult,
  encodeFunctionData,
  isAddress,
} from "viem";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import {
  BULLMETER_ADDRESS,
  TRANSACTION_ATTRIBUTION_BUILDER_CODE,
  ZERO_ADDRESS,
} from "@/lib/constants";
import { BullMeter, CreateBullMeter } from "@/lib/database/db.schema";
import {
  getAddressFromBaseName,
  getAddressFromEnsName,
} from "@/lib/ens/client";
import {
  GetAllPollsByCreatorResponse,
  ReadPollData,
} from "@/lib/types/bullmeter.type";
import { Guest } from "@/lib/types/poll.type";

// Types for wallet_sendCalls
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
        url: process.env.NEXT_PUBLIC_PAYMASTER_URL || "",
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

    return { success: true, result };
  } catch (error: any) {
    console.log("Batch transaction failed:", error);

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

export const useBullmeterPlugin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Builder code for transaction attribution
  const builderCode = TRANSACTION_ATTRIBUTION_BUILDER_CODE;

  // Helper function to add builder code attribution to transaction data
  const addAttributionSuffix = useCallback((data: string): string => {
    const dataSuffix = Attribution.toDataSuffix({
      codes: [builderCode],
    });
    return data + dataSuffix.slice(2); // strip 0x from suffix
  }, []);

  // Helper function to get wallet connection and switch to Base
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

  // Helper function to execute batch transactions
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
        console.log(`${operation} transaction failed:`, batchResult.error);
        throw new Error(`${operation} failed: ${batchResult.error}`);
      }
    },
    [getWalletConnection],
  );

  // Bullmeter create function calls
  const createBullmeter = useCallback(
    async (
      brandId: string,
      question: string,
      votePrice: string,
      startTime: number,
      duration: number,
      maxVotePerUser: number,
      guests: Guest[],
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const { provider, address } = await getWalletConnection();

        // Find the poll owner guest
        const pollOwner = guests.find((guest) => guest.owner);

        // Get the guest address and split percent
        let ownerAddress: Address = ZERO_ADDRESS;

        if (pollOwner) {
          const pollOwnerNameOrAddress = pollOwner.nameOrAddress;
          const ownerAddressFinding = isAddress(pollOwnerNameOrAddress)
            ? pollOwnerNameOrAddress
            : pollOwnerNameOrAddress.includes(".base.eth")
              ? await getAddressFromBaseName(pollOwnerNameOrAddress as Address)
              : pollOwnerNameOrAddress.includes(".eth")
                ? await getAddressFromEnsName(pollOwnerNameOrAddress as Address)
                : null;
          ownerAddress = !!ownerAddressFinding
            ? ownerAddressFinding
            : ownerAddress;
        }

        // Find the live guest if there is one
        const liveGuest = guests.find((guest) => !guest.owner);

        // Get the guest address and split percent
        let guestAddress: Address = ZERO_ADDRESS;
        let guestSplitPercent = 0.0;

        if (liveGuest) {
          const liveGuestNameOrAddress = liveGuest.nameOrAddress;
          const guestAddressFinding = isAddress(liveGuestNameOrAddress)
            ? liveGuestNameOrAddress
            : liveGuestNameOrAddress.includes(".base.eth")
              ? await getAddressFromBaseName(liveGuestNameOrAddress as Address)
              : liveGuestNameOrAddress.includes(".eth")
                ? await getAddressFromEnsName(liveGuestNameOrAddress as Address)
                : null;
          guestAddress = !!guestAddressFinding
            ? guestAddressFinding
            : guestAddress;
          guestSplitPercent = guestAddressFinding
            ? Number(liveGuest.splitPercent)
            : 0.0;
        }

        // If the guest address is the same as the owner address, set the guest address to
        // the native token address and the guest split percent to 0.0 because the owner will
        // receive all the rewards
        if (guestAddress.toLowerCase() === ownerAddress.toLowerCase()) {
          guestAddress = ZERO_ADDRESS;
          guestSplitPercent = 0.0;
        }

        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "createPoll",
          args: [
            question, // string calldata _question
            BigInt(votePrice), // uint256 _votePrice (assuming 6 decimals for USDC)
            BigInt(startTime), // uint256 _startTime
            BigInt(duration), // uint256 _duration
            BigInt(maxVotePerUser), // uint256 _maxVotePerUser
            guestAddress, // address _guest
            BigInt(guestSplitPercent * 100), // uint256 _guestSplitPercent
          ],
        });

        const calls: SendCallsCall[] = [
          {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: addAttributionSuffix(encodedFunctionCall),
          },
        ];

        const createResult = await executeBatch(calls, "Bullmeter create");

        let updatedLastPollId: string | undefined;
        let updatedLastPollDeadline: bigint | undefined;

        if (createResult.success) {
          console.log(
            "✅ Poll creation transaction confirmed, reading updated last active poll...",
          );

          // Wait a moment for the transaction to be fully processed
          await new Promise((resolve) => setTimeout(resolve, 4000));

          const lastPollEncodedCall = encodeFunctionData({
            abi: bullMeterAbi,
            functionName: "getLastActivePollForCreator",
            args: [address as `0x${string}`],
          });

          // Read the last active poll again to verify the change
          const updatedLastPollResult = await provider.request({
            method: "eth_call",
            params: [
              {
                to: BULLMETER_ADDRESS,
                data: lastPollEncodedCall,
              },
              "latest",
            ],
          });

          const updatedDecodedLastPoll = decodeFunctionResult({
            abi: bullMeterAbi,
            functionName: "getLastActivePollForCreator",
            data: updatedLastPollResult as `0x${string}`,
          });

          updatedLastPollId = updatedDecodedLastPoll[0];
          const updatedLastPollVotePrice = updatedDecodedLastPoll[4];
          updatedLastPollDeadline = updatedDecodedLastPoll[6];

          // Store the poll data in the database
          try {
            const pollData: CreateBullMeter = {
              brandId,
              prompt: question,
              pollId: updatedLastPollId as `0x${string}`,
              votePrice: (
                Number(updatedLastPollVotePrice) /
                10 ** 6
              ).toString(),
              duration: duration,
              ownerAddress,
              guestAddress,
              guestSplitPercent: guestSplitPercent.toString(),
              totalYesVotes: 0,
              totalNoVotes: 0,
              deadline: Number(updatedLastPollDeadline),
            };

            const response = await ky.post<{
              success: boolean;
              error?: string;
              data?: BullMeter;
            }>("/api/bullmeters", {
              json: pollData,
              timeout: false,
            });

            if (response.ok) {
              const result = await response.json();
              console.log("✅ Poll data stored in database:", result);
            } else {
              const errorData = await response.json();
              console.log(
                "❌ Failed to store poll data in database:",
                errorData,
              );
            }
          } catch (dbError) {
            console.log("Database storage error:", dbError);
          }
        }

        return {
          ...createResult,
          pollId: createResult.success ? updatedLastPollId : undefined,
          deadline: createResult.success
            ? Number(updatedLastPollDeadline)
            : undefined,
        };
      } catch (err: any) {
        console.log("Bullmeter create error:", err);
        setError(err.message || "Bullmeter create failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch, addAttributionSuffix],
  );

  // Bullmeter extend function calls
  const extendBullmeter = useCallback(
    async (pollId: string, newDuration: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "extendDeadline",
          args: [
            pollId as `0x${string}`, // bytes32 _pollId
            BigInt(newDuration), // uint256 _newDuration
          ],
        });

        const calls: SendCallsCall[] = [
          {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: addAttributionSuffix(encodedFunctionCall),
          },
        ];

        const extendResult = await executeBatch(calls, "Bullmeter extend");

        let updatedLastPollDeadline: bigint | undefined;
        let votesCount: number | undefined;
        let totalYesVotes: number | undefined;
        let totalNoVotes: number | undefined;

        if (extendResult.success) {
          console.log(
            "✅ Poll extension transaction confirmed, updating database...",
          );

          // Update the database with new duration and deadline
          try {
            // Wait a moment for the transaction to be fully processed
            await new Promise((resolve) => setTimeout(resolve, 4000));

            const { provider, address } = await getWalletConnection();

            const lastPollEncodedCall = encodeFunctionData({
              abi: bullMeterAbi,
              functionName: "getLastActivePollForCreator",
              args: [address as `0x${string}`],
            });

            // Read the last active poll again to verify the change
            const updatedLastPollResult = await provider.request({
              method: "eth_call",
              params: [
                {
                  to: BULLMETER_ADDRESS,
                  data: lastPollEncodedCall,
                },
                "latest",
              ],
            });

            const updatedDecodedLastPoll = decodeFunctionResult({
              abi: bullMeterAbi,
              functionName: "getLastActivePollForCreator",
              data: updatedLastPollResult as `0x${string}`,
            });

            updatedLastPollDeadline = updatedDecodedLastPoll[6];

            const response = await ky.patch<{
              success: boolean;
              error?: string;
              data?: BullMeter;
              votes?: { yes: number; no: number; total: number };
            }>("/api/bullmeters/extend", {
              json: {
                pollId: pollId,
                newDuration: newDuration,
                newDeadline: Number(updatedLastPollDeadline),
              },
              timeout: false,
            });

            if (response.ok) {
              const result = await response.json();
              votesCount =
                result.votes?.total ??
                (result.data?.totalYesVotes ?? 0) +
                  (result.data?.totalNoVotes ?? 0);
              totalYesVotes = result.data?.totalYesVotes ?? 0;
              totalNoVotes = result.data?.totalNoVotes ?? 0;
              console.log("✅ Poll duration updated in database:", result);
            } else {
              const errorData = await response.json();
              console.log(
                "❌ Failed to update poll duration in database:",
                errorData,
              );
            }
          } catch (dbError) {
            console.log("Database update error:", dbError);
          }
        }

        return {
          ...extendResult,
          pollId: extendResult.success ? pollId : undefined,
          deadline: extendResult.success
            ? Number(updatedLastPollDeadline)
            : undefined,
          votesCount,
          totalYesVotes,
          totalNoVotes,
        };
      } catch (err: any) {
        console.log("Bullmeter extend error:", err);
        setError(err.message || "Bullmeter extend failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch, addAttributionSuffix],
  );

  // Bullmeter terminate function calls
  const terminateAndClaimBullmeter = useCallback(
    async (pollId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "claimFundAndTerminate",
          args: [pollId as `0x${string}`], // bytes32 _pollId
        });

        const calls: SendCallsCall[] = [
          {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: addAttributionSuffix(encodedFunctionCall),
          },
        ];

        const terminateResult = await executeBatch(
          calls,
          "Bullmeter terminate",
        );

        let updatedPollState: bigint | undefined;
        let votesYes: number | undefined;
        let votesNo: number | undefined;
        let votesTotal: number | undefined;

        if (terminateResult.success) {
          console.log(
            "✅ Poll termination transaction confirmed, updating database...",
          );

          // Update the database to mark poll as terminated
          try {
            // Wait a moment for the transaction to be fully processed
            await new Promise((resolve) => setTimeout(resolve, 4000));

            const { provider } = await getWalletConnection();

            const pollStateEncodedCall = encodeFunctionData({
              abi: bullMeterAbi,
              functionName: "getPollState",
              args: [pollId as `0x${string}`],
            });

            // Read the last active poll again to verify the change
            const updatedPollStateResult = await provider.request({
              method: "eth_call",
              params: [
                {
                  to: BULLMETER_ADDRESS,
                  data: pollStateEncodedCall,
                },
                "latest",
              ],
            });

            const updatedDecodedLastPoll = decodeFunctionResult({
              abi: bullMeterAbi,
              functionName: "getPollState",
              data: updatedPollStateResult as `0x${string}`,
            });

            updatedPollState = updatedDecodedLastPoll[5];

            const response = await ky.patch<{
              success: boolean;
              error?: string;
              data?: BullMeter;
              votes?: { yes: number; no: number; total: number };
            }>("/api/bullmeters/terminate", {
              json: {
                pollId: pollId,
                newDeadline: Number(updatedPollState),
              },
              timeout: false,
            });

            if (response.ok) {
              const result = await response.json();
              votesYes = result.votes?.yes ?? result.data?.totalYesVotes ?? 0;
              votesNo = result.votes?.no ?? result.data?.totalNoVotes ?? 0;
              votesTotal =
                result.votes?.total ??
                (result.data?.totalYesVotes ?? 0) +
                  (result.data?.totalNoVotes ?? 0);
              console.log("✅ Poll marked as terminated in database:", result);
            } else {
              const errorData = await response.json();
              console.log(
                "❌ Failed to update poll status in database:",
                errorData,
              );
            }
          } catch (dbError) {
            console.log("Database update error:", dbError);
          }
        }

        return {
          ...terminateResult,
          pollId: terminateResult.success ? pollId : undefined,
          deadline: terminateResult.success
            ? Number(updatedPollState)
            : undefined,
          votes: {
            yes: votesYes ?? 0,
            no: votesNo ?? 0,
            total: votesTotal ?? 0,
          },
        };
      } catch (err: any) {
        console.log("Bullmeter terminate error:", err);
        setError(err.message || "Bullmeter terminate failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch, addAttributionSuffix],
  );

  // Bullmeter read history from an address function calls
  const getAllPollsByCreator =
    useCallback(async (): Promise<GetAllPollsByCreatorResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const { provider, address } = await getWalletConnection();

        // Encode the function call
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "getAllPollsByCreator",
          args: [address as `0x${string}`],
        });

        // Call the contract function
        const result = await provider.request({
          method: "eth_call",
          params: [
            {
              to: BULLMETER_ADDRESS,
              data: encodedFunctionCall,
            },
            "latest",
          ],
        });

        // Decode the result using the contract ABI
        const decodedResult = decodeFunctionResult({
          abi: bullMeterAbi,
          functionName: "getAllPollsByCreator",
          data: result as `0x${string}`,
        });

        return { success: true, result: decodedResult as ReadPollData[] };
      } catch (err: any) {
        console.log("getAllPollsByCreator error:", err);
        const errorMessage = err.message || "Failed to get polls by creator";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, [getWalletConnection]);

  return {
    createBullmeter,
    extendBullmeter,
    terminateAndClaimBullmeter,
    getAllPollsByCreator,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
