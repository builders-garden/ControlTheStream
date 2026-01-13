import { Config, sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { useState } from "react";
import { parseEther } from "viem";

// Pyro deposit address for Base chain burns
const PYRO_DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PYRO_DEPOSIT_ADDRESS!;

interface UsePyroBurnProps {
  wagmiConfig: Config;
}

interface PyroBurnParams {
  ethAmount: string;
  creatorTokenAddress: string;
  walletAddress: string;
  zoraHandle?: string;
  advertisingMessage?: string;
  externalSponsorName?: string;
}

interface PyroBurnResult {
  success: boolean;
  burnId?: string;
  tokensBurned?: string;
  ethSpent?: string;
  swapTxHash?: string;
  burnTxHash?: string;
  error?: string;
}

export const usePyroBurn = ({ wagmiConfig }: UsePyroBurnProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [isProcessingBurn, setIsProcessingBurn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const burn = async (
    params: PyroBurnParams,
    onSuccess?: (result: PyroBurnResult) => void,
    onError?: (error: string) => void,
  ): Promise<PyroBurnResult> => {
    const {
      ethAmount,
      creatorTokenAddress,
      walletAddress,
      zoraHandle,
      advertisingMessage,
      externalSponsorName,
    } = params;

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Step 1: Send ETH to Pyro deposit address
      setIsSendingTx(true);
      const hash = await sendTransaction(wagmiConfig, {
        to: PYRO_DEPOSIT_ADDRESS as `0x${string}`,
        value: parseEther(ethAmount),
      });

      setTxHash(hash);
      setIsSendingTx(false);

      // Step 2: Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1,
      });

      // Step 3: Call Pyro burn API via internal proxy
      setIsProcessingBurn(true);
      const response = await fetch("/api/pyro/burns/base", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: walletAddress,
          txSignature: hash,
          creatorTokenAddress,
          zoraHandle,
          slippage: 0.05,
          ...(advertisingMessage && { advertisingMessage }),
          ...(externalSponsorName && { externalSponsorName }),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Burn failed");
      }

      setIsProcessingBurn(false);
      setIsLoading(false);

      const burnResult: PyroBurnResult = {
        success: true,
        burnId: result.burnId,
        tokensBurned: result.tokensBurned,
        ethSpent: result.ethSpent,
        swapTxHash: result.swap?.txHash,
        burnTxHash: result.burn_tx?.txHash,
      };

      onSuccess?.(burnResult);
      return burnResult;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setIsLoading(false);
      setIsSendingTx(false);
      setIsProcessingBurn(false);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    burn,
    isLoading,
    isSendingTx,
    isProcessingBurn,
    error,
    txHash,
  };
};
