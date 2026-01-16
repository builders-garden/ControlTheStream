"use client";

import { Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CancelButton } from "@/components/custom-ui/cancel-button";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { CTSModal } from "@/components/custom-ui/cts-modal";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useAiTextCensor } from "@/hooks/use-ai-text-censor";
import { censorTextLocally } from "@/lib/ai-censor";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { AuthTokenType } from "@/lib/enums";
import { cn } from "@/lib/utils";

const MAX_SPONSOR_MESSAGE_LENGTH = 100;
const MIN_ETH_AMOUNT = 0.000001;

interface WebAppPyroCustomModalProps {
  isProcessing: boolean;
  handleSponsor: (
    amount: number,
    customMessage?: string,
    sponsorName?: string,
  ) => Promise<void>;
  connectedAddress?: string;
  brandSlug?: string;
  selectedSponsorName?: string;
}

export const WebAppPyroCustomModal = ({
  isProcessing,
  handleSponsor,
  connectedAddress,
  brandSlug,
  selectedSponsorName,
}: WebAppPyroCustomModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");

  const { mutate: censorTextWithAI } = useAiTextCensor(
    AuthTokenType.WEB_APP_AUTH_TOKEN,
  );

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setTimeout(() => {
      setIsEditingAmount(false);
      setIsEditingMessage(false);
      setCustomAmount("");
      setCustomMessage("");
    }, 300);
  };

  const handleCustomSponsor = async () => {
    if (!connectedAddress) {
      toast.info("Please connect your wallet to sponsor");
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < MIN_ETH_AMOUNT) {
      toast.error(`Minimum amount is ${MIN_ETH_AMOUNT} ETH`);
      return;
    }

    // If there's a custom message, censor it
    if (customMessage.trim()) {
      censorTextWithAI(
        { text: customMessage },
        {
          onSuccess: async (data) => {
            await handleSponsor(amount, data.censoredText, selectedSponsorName);
            handleModalToggle();
          },
          onError: async () => {
            const censoredText = censorTextLocally(customMessage);
            await handleSponsor(amount, censoredText, selectedSponsorName);
            handleModalToggle();
          },
        },
      );
    } else {
      await handleSponsor(amount, undefined, selectedSponsorName);
      handleModalToggle();
    }
  };

  const isBrandTheRollup = brandSlug === THE_ROLLUP_BRAND_SLUG;

  return (
    <CTSModal
      trigger={
        isBrandTheRollup ? (
          <TheRollupButton disabled={isProcessing} className="w-full">
            <p className="text-lg font-extrabold">Custom</p>
          </TheRollupButton>
        ) : (
          <CTSButton
            disabled={isProcessing}
            className="w-full bg-orange-500/20 border-orange-500 hover:bg-orange-500/30 border-2">
            <p className="text-lg font-extrabold text-orange-500">Custom</p>
          </CTSButton>
        )
      }
      isOpen={isModalOpen}
      setIsOpen={handleModalToggle}
      contentClassName="p-4 sm:p-6 rounded-[12px] sm:max-w-2xl">
      <div className="flex flex-col justify-center items-center w-full gap-1">
        <div className="flex items-center gap-2">
          <Flame className="size-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-center">PYRO</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Enter your ETH amount and optional advertising message
        </p>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-2.5 my-4">
        {/* ETH Amount Input */}
        <div
          className={cn(
            "flex justify-center items-center w-full gap-2 rounded-[12px] border-muted border-[1px] ring-muted-foreground/40 px-3 transition-all duration-300",
            isBrandTheRollup && "border-accent ring-accent/40",
            isEditingAmount && "ring-[2px]",
          )}>
          <input
            placeholder="0.01"
            className="w-full h-[42px] focus-visible:ring-none focus-visible:border-none rounded-[12px] transition-all duration-300 outline-none focus:ring-none focus:ring-0 focus:border-none bg-transparent"
            type="number"
            step="0.001"
            min={MIN_ETH_AMOUNT}
            value={customAmount}
            onFocus={() => setIsEditingAmount(true)}
            onBlur={() => setIsEditingAmount(false)}
            onChange={(e) => {
              const value = e.target.value;
              if (
                value === "" ||
                (!isNaN(Number(value)) && Number(value) >= 0)
              ) {
                setCustomAmount(value);
              }
            }}
          />
          <span className="text-muted-foreground font-medium">ETH</span>
        </div>

        {/* Advertising Message Input */}
        <div
          className={cn(
            "flex justify-center items-center w-full gap-1 rounded-[12px] border-muted border-[1px] ring-muted-foreground/40 px-3 transition-all duration-300",
            isBrandTheRollup && "border-accent ring-accent/40",
            isEditingMessage && "ring-[2px]",
          )}>
          <input
            placeholder="Your advertising message (optional)"
            className="w-full h-[42px] focus-visible:ring-none focus-visible:border-none rounded-[12px] transition-all duration-300 outline-none focus:ring-none focus:ring-0 focus:border-none bg-transparent"
            type="text"
            value={customMessage}
            onFocus={() => setIsEditingMessage(true)}
            onBlur={() => setIsEditingMessage(false)}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= MAX_SPONSOR_MESSAGE_LENGTH) {
                setCustomMessage(value);
              } else {
                setCustomMessage(value.slice(0, MAX_SPONSOR_MESSAGE_LENGTH));
              }
            }}
          />
          <p className="text-sm text-muted-foreground shrink-0">
            {customMessage.length}/{MAX_SPONSOR_MESSAGE_LENGTH}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-2">
        {isBrandTheRollup ? (
          <TheRollupButton
            className="w-full bg-accent"
            onClick={handleCustomSponsor}
            disabled={
              isProcessing ||
              !customAmount ||
              parseFloat(customAmount) < MIN_ETH_AMOUNT
            }>
            <p className="text-base font-extrabold text-white">
              {isProcessing ? "Processing..." : "Sponsor"}
            </p>
          </TheRollupButton>
        ) : (
          <CTSButton
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
            onClick={handleCustomSponsor}
            disabled={
              isProcessing ||
              !customAmount ||
              parseFloat(customAmount) < MIN_ETH_AMOUNT
            }>
            <p className="text-base font-extrabold text-white">
              {isProcessing ? "Processing..." : "Sponsor"}
            </p>
          </CTSButton>
        )}

        {isBrandTheRollup ? (
          <button
            className="text-base font-bold text-black cursor-pointer mt-3"
            onClick={handleModalToggle}>
            Cancel
          </button>
        ) : (
          <CancelButton onClick={handleModalToggle} />
        )}
      </div>
    </CTSModal>
  );
};
