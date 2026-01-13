"use client";

import { Flame, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useConfetti } from "@/hooks/use-confetti";
import { usePyroBurn } from "@/hooks/use-pyro-burn";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { wagmiConfigWebApp } from "@/lib/reown";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress } from "@/lib/utils";
import { WebAppPyroCustomModal } from "./web-app-pyro-custom-modal";

// Default ETH amounts for sponsoring
const SPONSOR_AMOUNTS = [
  { amount: 0.001, label: "0.001 ETH" },
  { amount: 0.005, label: "0.005 ETH" },
  { amount: 0.01, label: "0.01 ETH" },
];

interface WebAppPyroSponsorProps {
  showLabel?: boolean;
  creatorTokenAddress: string;
  zoraHandle?: string;
  user?: User;
}

export const WebAppPyroSponsor = ({
  showLabel = true,
  creatorTokenAddress,
  zoraHandle,
  user,
}: WebAppPyroSponsorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { brand } = useWebAppAuth();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({ duration: 500 });

  const { burn, isSendingTx, isProcessingBurn } = usePyroBurn({
    wagmiConfig: wagmiConfigWebApp,
  });

  // Get user display name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;
  const displayName =
    baseName || user?.username || formatWalletAddress(address);

  const handleSponsor = async (amount: number, customMessage?: string) => {
    if (!address) {
      toast.info("Please connect your wallet to sponsor");
      return;
    }

    if (!creatorTokenAddress) {
      toast.error("Creator token not configured");
      return;
    }

    try {
      setIsProcessing(true);

      await burn(
        {
          ethAmount: amount.toString(),
          creatorTokenAddress,
          walletAddress: address,
          zoraHandle,
          advertisingMessage: customMessage,
          externalSponsorName: displayName,
        },
        (result) => {
          toast.success(
            `Successfully sponsored! ${result.tokensBurned} tokens burned`,
          );
          startConfetti();
        },
        (error) => {
          toast.error(`Sponsorship failed: ${error}`);
        },
      );
    } catch (error) {
      toast.error("Sponsorship failed");
      console.error("Pyro sponsor error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isProcessing || isSendingTx || isProcessingBurn;
  const isBrandTheRollup = brand.data?.slug === THE_ROLLUP_BRAND_SLUG;

  const getButtonText = () => {
    if (isSendingTx) return "Sending...";
    if (isProcessingBurn) return "Processing...";
    return null;
  };

  const ButtonComponent = isBrandTheRollup ? TheRollupButton : CTSButton;

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      {showLabel && (
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-orange-500" />
          <h1 className="text-2xl font-bold">Sponsor with Pyro</h1>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Burn ETH to sponsor this stream and get featured
      </p>

      <div className="grid grid-cols-2 w-full gap-2.5">
        {SPONSOR_AMOUNTS.map((sponsor) => (
          <ButtonComponent
            key={sponsor.amount}
            onClick={() => handleSponsor(sponsor.amount)}
            disabled={isDisabled}
            className={cn(
              "w-full",
              !isBrandTheRollup &&
                "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0",
            )}>
            {isDisabled && isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">{getButtonText()}</span>
              </div>
            ) : (
              <p
                className={cn(
                  "text-lg font-extrabold",
                  !isBrandTheRollup && "text-white",
                )}>
                {sponsor.label}
              </p>
            )}
          </ButtonComponent>
        ))}

        <WebAppPyroCustomModal
          brandSlug={brand.data?.slug || ""}
          isProcessing={isDisabled}
          handleSponsor={handleSponsor}
          connectedAddress={address}
        />
      </div>
    </div>
  );
};
