"use client";

import { ChevronDown, Flame, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useConfetti } from "@/hooks/use-confetti";
import { usePyroBurn } from "@/hooks/use-pyro-burn";
import { PyroCommunity, usePyroCommunities } from "@/hooks/use-pyro-communities";
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
  const [selectedSponsor, setSelectedSponsor] = useState<PyroCommunity | null>(
    null,
  );
  const { brand } = useWebAppAuth();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({ duration: 500 });

  const { burn, isSendingTx, isProcessingBurn } = usePyroBurn({
    wagmiConfig: wagmiConfigWebApp,
  });

  // Fetch external sponsor communities
  const { data: communitiesData } = usePyroCommunities({
    sponsorType: "external",
  });
  const externalSponsors = communitiesData?.data || [];

  // Get user display name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;
  const displayName =
    baseName || user?.username || formatWalletAddress(address);

  const handleSponsor = async (
    amount: number,
    customMessage?: string,
    sponsorName?: string,
  ) => {
    if (!address) {
      toast.info("Please connect your wallet to sponsor");
      return;
    }

    if (!creatorTokenAddress) {
      toast.error("Creator token not configured");
      return;
    }

    // Use provided sponsor name, selected sponsor, or fallback to display name
    const externalSponsorName =
      sponsorName ||
      selectedSponsor?.externalSponsor?.name ||
      displayName;

    try {
      setIsProcessing(true);

      await burn(
        {
          ethAmount: amount.toString(),
          creatorTokenAddress,
          walletAddress: address,
          zoraHandle,
          advertisingMessage: customMessage,
          externalSponsorName,
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

      {/* Sponsor Selector */}
      {externalSponsors.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              initial={{
                boxShadow: isBrandTheRollup
                  ? "4px 4px 0px 0px #000000"
                  : "4px 4px 0px 0px #ea580c",
                border: isBrandTheRollup
                  ? "1px solid #000000"
                  : "1px solid #ea580c",
              }}
              animate={{
                boxShadow: isBrandTheRollup
                  ? "4px 4px 0px 0px #000000"
                  : "4px 4px 0px 0px #ea580c",
                border: isBrandTheRollup
                  ? "1px solid #000000"
                  : "1px solid #ea580c",
              }}
              whileTap={{
                x: 4,
                y: 4,
                boxShadow: "none",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2.5 rounded-[12px] bg-background cursor-pointer",
              )}>
              <div className="flex items-center gap-3">
                {selectedSponsor?.externalSponsor?.sponsorImageUrl ? (
                  <Image
                    src={selectedSponsor.externalSponsor.sponsorImageUrl}
                    alt={selectedSponsor.externalSponsor.name || "Sponsor"}
                    width={64}
                    height={64}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center",
                      isBrandTheRollup ? "bg-black/10" : "bg-orange-500/20",
                    )}>
                    <Flame
                      className={cn(
                        "size-4",
                        isBrandTheRollup ? "text-black" : "text-orange-500",
                      )}
                    />
                  </div>
                )}
                <span className="text-sm font-medium">
                  {selectedSponsor?.externalSponsor?.name || "Select a sponsor"}
                </span>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-full min-w-[220px]">
            {externalSponsors.map((sponsor) => (
              <DropdownMenuItem
                key={sponsor._id}
                onClick={() => setSelectedSponsor(sponsor)}
                className="flex items-center gap-3 cursor-pointer py-2">
                {sponsor.externalSponsor?.sponsorImageUrl ? (
                  <Image
                    src={sponsor.externalSponsor.sponsorImageUrl}
                    alt={sponsor.externalSponsor.name || "Sponsor"}
                    width={64}
                    height={64}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {sponsor.externalSponsor?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <span className="text-sm">
                  {sponsor.externalSponsor?.name || "Unknown"}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
          selectedSponsorName={selectedSponsor?.externalSponsor?.name}
        />
      </div>
    </div>
  );
};
