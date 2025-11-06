import sdk from "@farcaster/miniapp-sdk";
import { ArrowDownUp, ArrowUp, ChartColumn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import {
  BASE_USDC_ADDRESS,
  BASE_USDC_LOGO_URL,
  FARCASTER_CLIENT_FID,
  ZERO_ADDRESS,
} from "@/lib/constants";
import { CreatorCoin } from "@/lib/database/db.schema";
import { PopupPositions } from "@/lib/enums";
import { User } from "@/lib/types/user.type";
import { buildImageUrlFromCid, formatWalletAddress } from "@/lib/utils";
import { formatSingleToken } from "@/lib/utils/farcaster-tokens";

interface MiniAppCreatorCoinProps {
  coin: CreatorCoin;
  user?: User;
  brandSlug?: string;
}

export const MiniAppCreatorCoin = ({
  coin,
  user,
  brandSlug,
}: MiniAppCreatorCoinProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tokenTraded } = useSocketUtils();
  const { address } = useAccount();

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Handle token swap
  const handleSwapToken = async () => {
    try {
      setIsProcessing(true);

      const tokenName = coin.symbol || coin.name || "";
      const tokenAddress = coin.address || ZERO_ADDRESS;
      const tokenChainId = coin.chainId || 8453;
      const tokenImageUrl = buildImageUrlFromCid(coin.logoUrl) || "";

      const sellToken = formatSingleToken(BASE_USDC_ADDRESS); // USDC on Base
      const buyToken = formatSingleToken(tokenAddress, tokenChainId);
      const result = await sdk.actions.swapToken({
        sellToken,
        buyToken,
        sellAmount: "30000",
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (result.success && result.swap.transactions) {
        if (
          (await sdk.context).client.clientFid ===
          FARCASTER_CLIENT_FID.farcaster
        ) {
          if (result.swap.transactions.length > 0) {
            tokenTraded({
              brandId: coin.brandId || "",
              position: PopupPositions.TOP_CENTER,
              username: baseName || formatWalletAddress(address),
              profilePicture: user?.avatarUrl || "",
              tokenInAmount: "",
              tokenInName: "USDC",
              tokenInDecimals: 6,
              tokenInImageUrl: BASE_USDC_LOGO_URL,
              tokenOutAmount: "",
              tokenOutDecimals: 18,
              tokenOutName: tokenName,
              tokenOutImageUrl: tokenImageUrl,
            });
          }
        } else {
          tokenTraded({
            brandId: coin.brandId || "",
            position: PopupPositions.TOP_CENTER,
            username: baseName || formatWalletAddress(address),
            profilePicture: user?.avatarUrl || "",
            tokenInAmount: "",
            tokenInName: "USDC",
            tokenInDecimals: 6,
            tokenInImageUrl: BASE_USDC_LOGO_URL,
            tokenOutAmount: "",
            tokenOutDecimals: 18,
            tokenOutName: tokenName,
            tokenOutImageUrl: tokenImageUrl,
          });
        }
      }
    } catch (error) {
      console.error(
        `Token swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle token show chart
  const handleShowChart = async () => {
    try {
      const tokenAddress = coin.address || ZERO_ADDRESS;
      const tokenChainId = coin.chainId || 8453;

      const tokenToView = formatSingleToken(tokenAddress, tokenChainId);
      await sdk.actions.viewToken({
        token: tokenToView,
      });
    } catch (error) {
      console.error(
        `Token view failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">Creator Coin</h1>
      <div
        className="flex justify-between items-center w-full py-3 px-4 rounded-[8px]"
        style={{ backgroundColor: "#57FFDD" }}>
        <div className="flex justify-start items-center gap-3 flex-1 min-w-0">
          {/* Icon with upward arrow */}
          <div
            className="size-12 rounded-full flex justify-center items-center shrink-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
            {coin.logoUrl ? (
              <Image
                src={buildImageUrlFromCid(coin.logoUrl)}
                alt={coin.name || ""}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <ArrowUp className="size-6 text-white" strokeWidth={2} />
            )}
          </div>
          {/* Symbol */}
          <p className="text-base font-extrabold uppercase truncate text-black">
            ${coin.symbol || coin.name || ""}
          </p>
        </div>
        {/* Action buttons */}
        <div className="flex justify-end items-center gap-2 shrink-0">
          <button
            onClick={handleSwapToken}
            className="size-[32px] p-0 rounded-[4px] flex justify-center items-center transition-colors"
            style={{ backgroundColor: "#212121" }}
            disabled={isProcessing}>
            <ArrowDownUp
              className="size-4 shrink-0 text-white"
              strokeWidth={1.5}
            />
          </button>
          <button
            onClick={handleShowChart}
            className="size-[32px] p-0 rounded-[4px] flex justify-center items-center transition-colors"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
            disabled={isProcessing}>
            <ChartColumn
              className="size-4 shrink-0 text-white"
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
