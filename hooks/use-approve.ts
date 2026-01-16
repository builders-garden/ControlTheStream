import { readContract, sendCalls } from "@wagmi/core";
import { useState } from "react";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useAccount, useSendTransaction } from "wagmi";
import { BASE_USDC_ADDRESS, BULLMETER_ADDRESS } from "@/lib/constants";
import { wagmiConfigMiniApp } from "@/lib/reown";
import { env } from "@/lib/zod";

interface UseApproveProps {
  amount?: string; // Amount in USDC (e.g., "1" for 1 USDC)
  spender?: string; // Address to approve (defaults to BullMeter contract)
  source: "web-app" | "mini-app"; // Source of the approval
}

export const useApprove = ({
  amount = "1",
  spender = BULLMETER_ADDRESS,
  source,
}: UseApproveProps) => {
  const { address } = useAccount();
  const { sendTransaction } = useSendTransaction();

  // Parse the amount to USDC decimals (6 decimals for USDC)
  const parsedAmount = parseUnits(amount, 6);

  // State for tracking the call
  const [callId, setCallId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint | null>(null);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

  // Check current allowance
  const checkAllowance = async () => {
    if (!address) {
      console.error("❌ No wallet connected for allowance check");
      throw new Error("No wallet connected");
    }

    try {
      setIsCheckingAllowance(true);

      const allowance = await readContract(wagmiConfigMiniApp, {
        address: BASE_USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, spender as `0x${string}`],
      });

      setCurrentAllowance(allowance);
      return allowance;
    } catch (err) {
      console.error("❌ Error checking allowance:", err);
      throw err;
    } finally {
      setIsCheckingAllowance(false);
    }
  };

  // Execute the approval using sendCalls
  const approve = async () => {
    try {
      setIsPending(true);
      setIsError(false);
      setError(null);
      setIsSuccess(false);

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender as `0x${string}`, parsedAmount],
      });

      console.log("📤 Sending approval transaction...");

      if (source === "web-app") {
        // Wrap sendTransaction in a Promise to make it awaitable
        await new Promise<void>((resolve, reject) => {
          sendTransaction(
            {
              to: BASE_USDC_ADDRESS as `0x${string}`,
              data: approveData,
              value: BigInt(0),
            },
            {
              onSuccess: async () => {
                setIsSuccess(true);
                resolve();
              },
              onError: (error) => {
                reject(error);
              },
            },
          );
        });
      } else if (source === "mini-app") {
        // Send the call with higher gas price
        const result = await sendCalls(wagmiConfigMiniApp, {
          calls: [
            {
              to: BASE_USDC_ADDRESS as `0x${string}`,
              data: approveData,
            },
          ],
          capabilities: {
            paymasterService: {
              url: env.NEXT_PUBLIC_PAYMASTER_URL,
            },
          },
        });
        setCallId(result.id);
        setIsSuccess(true);
        // Additional wait to ensure transaction is fully processed
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 more seconds
      }
    } catch (err) {
      console.log("❌ Approval failed:", err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err; // Re-throw the error so it can be caught by the caller
    } finally {
      setIsPending(false);
    }
  };

  return {
    approve,
    checkAllowance,
    callId,
    isPending,
    isError,
    error,
    currentAllowance,
    isCheckingAllowance,
    // Combined loading state
    isLoading: isPending || isCheckingAllowance,
    // Combined success state
    isSuccess,
    // Combined error state
    hasError: isError,
  };
};
