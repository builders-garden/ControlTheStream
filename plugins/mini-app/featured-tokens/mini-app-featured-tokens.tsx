import sdk from "@farcaster/miniapp-sdk";
import { ArrowDownUp, ChartColumn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useCreateFeaturedTokenOpen } from "@/hooks/use-featured-tokens-opens";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import {
  BASE_USDC_ADDRESS,
  BASE_USDC_LOGO_URL,
  FARCASTER_CLIENT_FID,
  THE_ROLLUP_BRAND_SLUG,
  ZERO_ADDRESS,
} from "@/lib/constants";
import { FeaturedToken } from "@/lib/database/db.schema";
import { AuthTokenType, PopupPositions } from "@/lib/enums";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress, getChainLogoUrl } from "@/lib/utils";
import { formatSingleToken } from "@/lib/utils/farcaster-tokens";

interface MiniAppFeaturedTokensProps {
  tokens: FeaturedToken[];
  user?: User;
  brandSlug?: string;
}

export const MiniAppFeaturedTokens = ({
  tokens,
  user,
  brandSlug,
}: MiniAppFeaturedTokensProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tokenTraded } = useSocketUtils();
  const { address } = useAccount();

  // Mutation hook for creating a featured token open
  const { mutate: createFeaturedTokenOpen } = useCreateFeaturedTokenOpen(
    AuthTokenType.MINI_APP_AUTH_TOKEN,
  );

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Handle token swap
  const handleSwapToken = async (token: FeaturedToken) => {
    try {
      setIsProcessing(true);

      // token details
      const tokenName = token.symbol || token.name || "";
      const tokenAddress = token.address || ZERO_ADDRESS;
      const tokenChainId = token.chainId || 8453;
      const tokenImageUrl = token.logoUrl || "";
      const tokenDecimals = token.decimals || 18;

      // Placeholder token addresses - replace with actual token addresses
      const sellToken = formatSingleToken(BASE_USDC_ADDRESS); // USDC on Base
      const buyToken = formatSingleToken(tokenAddress, tokenChainId); // Placeholder token address
      const result = await sdk.actions.swapToken({
        sellToken,
        buyToken,
        sellAmount: "30000",
      });
      // await 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (result.success && result.swap.transactions) {
        const chainLogoUrl = tokenChainId
          ? getChainLogoUrl(tokenChainId.toString())
          : null;
        const externalUrl =
          tokenChainId && tokenAddress
            ? `https://matcha.xyz/tokens/${tokenChainId}/${tokenAddress}`
            : null;

        const featuredTokenOpenData = {
          brandId: token.brandId || "",
          address: tokenAddress,
          chainId: tokenChainId,
          symbol: tokenName,
          name: tokenName,
          logoUrl: tokenImageUrl,
          chainLogoUrl: chainLogoUrl,
          externalUrl: externalUrl,
          openerId: user?.id || "",
        };

        const tokenTradedData = {
          brandId: token.brandId || "",
          position: PopupPositions.TOP_CENTER,
          username: baseName || formatWalletAddress(address),
          profilePicture: user?.avatarUrl || "",
          tokenInAmount: "",
          tokenInName: "USDC",
          tokenInDecimals: 6,
          tokenInImageUrl: BASE_USDC_LOGO_URL,
          tokenOutAmount: "",
          tokenOutDecimals: tokenDecimals,
          tokenOutName: tokenName,
          tokenOutImageUrl: tokenImageUrl,
        };

        if (
          (await sdk.context).client.clientFid ===
          FARCASTER_CLIENT_FID.farcaster
        ) {
          if (result.swap.transactions.length > 0) {
            // Send socket message to the server
            tokenTraded(tokenTradedData);
          }

          // Create a record in the database
          createFeaturedTokenOpen({
            ...featuredTokenOpenData,
            platform: "farcaster",
          });
        } else {
          // Send socket message to the server
          tokenTraded(tokenTradedData);

          // Create a record in the database
          createFeaturedTokenOpen({
            ...featuredTokenOpenData,
            platform: "base",
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
  const handleShowChart = async (token: FeaturedToken) => {
    try {
      // token details
      const tokenAddress = token.address || ZERO_ADDRESS;
      const tokenChainId = token.chainId || 8453;

      // Placeholder token addresses - replace with actual token addresses
      const tokenToView = formatSingleToken(tokenAddress, tokenChainId); // Placeholder token address
      await sdk.actions.viewToken({
        token: tokenToView,
      });
    } catch (error) {
      console.error(
        `Token swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token, index) => (
          <div
            key={index}
            className={cn(
              "flex justify-between items-center w-full py-2.5 px-2.5 rounded-[8px] bg-card",
              brandSlug === THE_ROLLUP_BRAND_SLUG &&
                "border-black border-[1px]",
            )}>
            <div className="flex justify-start items-center w-full max-w-[50%] gap-[3px]">
              <Image
                src={token.logoUrl || "/images/coin.svg"}
                alt={token.name + index.toString()}
                width={16}
                height={16}
              />
              <p className="text-xs font-extrabold break-words">
                ${token.symbol || token.name || ""}
              </p>
            </div>
            <div className="flex justify-end items-center w-full gap-2">
              {brandSlug === THE_ROLLUP_BRAND_SLUG ? (
                <div className="flex justify-end items-center w-full gap-2">
                  <TheRollupButton
                    onClick={() => handleSwapToken(token)}
                    className="bg-accent size-[24px] p-0 rounded-[4px]"
                    disabled={isProcessing}>
                    <ArrowDownUp
                      className="size-4 shrink-0 text-white"
                      strokeWidth={1.5}
                    />
                  </TheRollupButton>
                  <TheRollupButton
                    onClick={() => handleShowChart(token)}
                    className="size-[24px] p-0 rounded-[4px]"
                    disabled={isProcessing}>
                    <ChartColumn
                      className="size-4 shrink-0"
                      strokeWidth={1.5}
                    />
                  </TheRollupButton>
                </div>
              ) : (
                <div className="flex justify-end items-center w-full gap-2">
                  <CTSButton
                    onClick={() => handleSwapToken(token)}
                    className="size-[24px] p-0 rounded-[4px]"
                    disabled={isProcessing}>
                    <ArrowDownUp
                      className="size-4 shrink-0 text-background"
                      strokeWidth={1.5}
                    />
                  </CTSButton>
                  <CTSButton
                    onClick={() => handleShowChart(token)}
                    className="bg-primary/30 hover:bg-primary/30 size-[24px] p-0 rounded-[4px]"
                    disabled={isProcessing}>
                    <ChartColumn
                      className="size-4 shrink-0 text-primary"
                      strokeWidth={1.5}
                    />
                  </CTSButton>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
