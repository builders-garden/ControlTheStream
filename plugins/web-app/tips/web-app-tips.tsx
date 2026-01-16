import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useCreateTip } from "@/hooks/use-tips";
import { useUsdcTransfer } from "@/hooks/use-usdc-transfer";
import {
  MAX_TIP_CUSTOM_MESSAGE_LENGTH,
  MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE,
  THE_ROLLUP_BRAND_SLUG,
} from "@/lib/constants";
import { TipSettings } from "@/lib/database/db.schema";
import { AuthTokenType, PopupPositions } from "@/lib/enums";
import { wagmiConfigWebApp } from "@/lib/reown";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress } from "@/lib/utils";
import { WebAppCustomTipModal } from "./web-app-custom-tip-modal";

interface WebAppTipsProps {
  label?: string;
  showLabel?: boolean;
  className?: string;
  tips: {
    amount: number;
    onClick?: () => void; // Made optional since we handle payment internally
    textClassName?: string;
    buttonColor?: "blue" | "black";
    buttonClassName?: string;
  }[];
  customTipButton?: {
    color?: "blue" | "black";
    text?: string;
    textClassName?: string;
    buttonClassName?: string;
  };
  tipSettings: TipSettings;
  user?: User;
}

export const WebAppTips = ({
  label = "Tip",
  showLabel = true,
  tipSettings,
  tips,
  customTipButton,
  user,
}: WebAppTipsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tipSent } = useSocketUtils();
  const { brand } = useWebAppAuth();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({ duration: 500 });
  const { mutate: createTip } = useCreateTip(AuthTokenType.WEB_APP_AUTH_TOKEN);

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Use your hook with fixed parameters
  const {
    transfer: transferUsdc,
    isLoading: isTransferLoading,
    error: transferError,
  } = useUsdcTransfer({
    amount: "1", // Default value
    receiver: tipSettings?.payoutAddress || "",
    wagmiConfig: wagmiConfigWebApp,
  });

  // Handle tip payment
  const handleTipPayment = async (amount: number, customText?: string) => {
    if (!address) {
      toast.info("Please connect your wallet to tip");
      return;
    }

    if (!tipSettings.payoutAddress || !user?.id) {
      return;
    }

    // If the custom text is over the maximum length of a custom message of a tip or the amount
    // is less than the minimum amount for a custom message, set it to empty
    let customTextToUse = customText;
    if (
      (customText?.length &&
        customText.length > MAX_TIP_CUSTOM_MESSAGE_LENGTH) ||
      amount < MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE
    ) {
      customTextToUse = "";
    }

    try {
      setIsProcessing(true);

      try {
        // Execute the transfer using your hook with dynamic parameters
        await transferUsdc(
          amount.toString(),
          tipSettings.payoutAddress,
          () => {
            tipSent({
              brandId: tipSettings.brandId,
              position: PopupPositions.TOP_CENTER,
              username:
                baseName || user?.username || formatWalletAddress(address),
              profilePicture: user?.avatarUrl || "",
              tipAmount: amount.toString(),
              customMessage: customTextToUse || "",
            });
            toast.success("Tip sent successfully");
            startConfetti();

            // Create a tip record in the database
            createTip({
              senderId: user.id,
              receiverBrandId: tipSettings.brandId,
              receiverAddress: tipSettings.payoutAddress,
              receiverBaseName: tipSettings.payoutBaseName,
              receiverEnsName: tipSettings.payoutEnsName,
              amount: amount.toString(),
              platform: "web-app",
              customMessage: customTextToUse,
            });
          },
          () => {
            console.log("USDC transfer failed:", transferError);
            throw transferError;
          },
        );
      } catch (error) {
        console.log("USDC transfer failed:", error);
        throw error;
      }
    } catch (error) {
      toast.error("Payment of tip failed");
      console.log(
        `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      {showLabel && <h1 className="text-2xl font-bold">{label}</h1>}
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tips.map((tip) => {
          return brand.data?.slug === THE_ROLLUP_BRAND_SLUG ? (
            <TheRollupButton
              key={tip.amount}
              onClick={() => handleTipPayment(tip.amount)}
              buttonColor={tip.buttonColor}
              disabled={isProcessing || isTransferLoading}
              className={cn("w-full", tip.buttonClassName)}>
              <p className={cn("text-lg font-extrabold", tip.textClassName)}>
                ${tip.amount}
              </p>
            </TheRollupButton>
          ) : (
            <CTSButton
              key={tip.amount}
              onClick={() => handleTipPayment(tip.amount)}
              disabled={isProcessing || isTransferLoading}
              className={cn(
                "w-full bg-secondary/20 border-secondary hover:bg-secondary/30 border-2",
                tip.buttonClassName,
              )}>
              <p
                className={cn(
                  "text-lg font-extrabold text-foreground",
                  tip.textClassName,
                )}>
                ${tip.amount}
              </p>
            </CTSButton>
          );
        })}

        {!!customTipButton && (
          <WebAppCustomTipModal
            brandSlug={brand.data?.slug || ""}
            customTipButton={customTipButton}
            isProcessing={isProcessing}
            isTransferLoading={isTransferLoading}
            handleTipPayment={handleTipPayment}
            connectedAddress={address}
          />
        )}
      </div>
    </div>
  );
};
